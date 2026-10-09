import { createPrivateKey, createPublicKey, generateKeyPairSync, randomUUID, type KeyObject } from "node:crypto";
import type { AuthTokensResponse } from "@mimt/shared";
import { SignJWT, jwtVerify, type JWK } from "jose";
import { unauthorized } from "../lib/errors.js";
import { randomToken, sha256Hex } from "../lib/crypto.js";
import type { Repository } from "../repo/types.js";

export const ACCESS_TTL_S = 15 * 60;
export const REFRESH_TTL_S = 30 * 24 * 60 * 60;
const AUDIENCE = "mimt-api";
/** Audience of short-lived media capability tokens (signed URLs); never accepted as an access token. */
const MEDIA_AUDIENCE = "mimt-media";

export type SessionTokens = AuthTokensResponse;

/** Loads the Ed25519 key from a JWK (JSON) or PKCS#8 PEM; generates an ephemeral one when absent (dev only). */
export function loadSigningKey(raw: string | undefined): { key: KeyObject; ephemeral: boolean } {
  if (!raw) return { key: generateKeyPairSync("ed25519").privateKey, ephemeral: true };
  const trimmed = raw.trim();
  const key = trimmed.startsWith("{")
    ? createPrivateKey({ key: JSON.parse(trimmed) as JWK & { kty: string }, format: "jwk" })
    : createPrivateKey(trimmed.replace(/\\n/g, "\n"));
  if (key.asymmetricKeyType !== "ed25519") throw new Error("MIMT_SESSION_SIGNING_KEY must be an Ed25519 private key");
  return { key, ephemeral: false };
}

export class SessionService {
  readonly publicJwk: JWK;
  private readonly publicKey: KeyObject;

  constructor(
    private readonly repo: Repository,
    private readonly privateKey: KeyObject,
    private readonly issuer: string,
  ) {
    this.publicKey = createPublicKey(privateKey);
    const jwk = this.publicKey.export({ format: "jwk" }) as JWK;
    this.publicJwk = { ...jwk, alg: "EdDSA", use: "sig", kid: sha256Hex(JSON.stringify(jwk)).slice(0, 16) };
  }

  async issue(userId: string, familyId: string = randomUUID()): Promise<SessionTokens> {
    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: "EdDSA", kid: this.publicJwk.kid })
      .setSubject(userId)
      .setIssuer(this.issuer)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setJti(randomUUID())
      .setExpirationTime(`${ACCESS_TTL_S}s`)
      .sign(this.privateKey);
    const refreshToken = randomToken(32);
    await this.repo.createRefreshToken({
      userId,
      familyId,
      tokenHash: sha256Hex(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_S * 1000),
    });
    return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: ACCESS_TTL_S };
  }

  async verifyAccess(token: string): Promise<string> {
    try {
      const { payload } = await jwtVerify(token, this.publicKey, { issuer: this.issuer, audience: AUDIENCE, algorithms: ["EdDSA"] });
      if (!payload.sub) throw new Error("no sub");
      return payload.sub;
    } catch {
      throw unauthorized("Invalid or expired access token");
    }
  }

  /**
   * Short-lived capability token for one media resource (e.g. "voicemail:<id>"), used in signed URLs
   * so players that cannot send an Authorization header can still fetch audio through the API.
   */
  async signMedia(resource: string, ttlSeconds: number): Promise<{ token: string; expiresAt: Date }> {
    const expiresAt = new Date(Math.floor(Date.now() / 1000 + ttlSeconds) * 1000);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "EdDSA", kid: this.publicJwk.kid })
      .setSubject(resource)
      .setIssuer(this.issuer)
      .setAudience(MEDIA_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.privateKey);
    return { token, expiresAt };
  }

  /** True when `token` is a valid, unexpired media token for exactly `resource`. */
  async verifyMedia(token: string, resource: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(token, this.publicKey, { issuer: this.issuer, audience: MEDIA_AUDIENCE, algorithms: ["EdDSA"] });
      return payload.sub === resource;
    } catch {
      return false;
    }
  }

  /** Rotates a refresh token. Reusing a rotated token revokes the whole family (theft signal). */
  async refresh(refreshToken: string): Promise<SessionTokens> {
    const row = await this.repo.findRefreshToken(sha256Hex(refreshToken));
    if (!row) throw unauthorized("Invalid refresh token");
    if (row.revokedAt) {
      await this.repo.revokeRefreshFamily(row.familyId);
      throw unauthorized("Refresh token reuse detected");
    }
    if (row.expiresAt.getTime() <= Date.now()) throw unauthorized("Refresh token expired");
    const user = await this.repo.getUser(row.userId);
    if (!user || user.status === "deleted" || user.status === "suspended") throw unauthorized("Account unavailable");
    if (!(await this.repo.revokeRefreshToken(row.id))) {
      await this.repo.revokeRefreshFamily(row.familyId);
      throw unauthorized("Refresh token reuse detected");
    }
    return this.issue(row.userId, row.familyId);
  }

  async logout(refreshToken: string): Promise<void> {
    const row = await this.repo.findRefreshToken(sha256Hex(refreshToken));
    if (row) await this.repo.revokeRefreshFamily(row.familyId);
  }
}
