import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";
import type { Config } from "../config.js";
import { HttpError, notConfigured, unauthorized } from "../lib/errors.js";
import type { Repository } from "../repo/types.js";

const ALGORITHMS = ["ES256", "EdDSA", "RS256"];
const HANDOFF_AUDIENCE = "mimt";
const HANDOFF_MAX_TTL_S = 60;
const CLOCK_SKEW_S = 5;

export interface TakatakIdentity {
  globalUserId: string;
  email: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  phone: string | null;
  name: string | null;
  locale: string | null;
  workspaceId: string | null;
  businessId: string | null;
}

export interface TakatakClient {
  exchangeCode(input: { code: string; codeVerifier: string; redirectUri: string; nonce?: string }): Promise<TakatakIdentity>;
  /** Verifies a server-to-server handoff JWT and consumes its jti. */
  verifyHandoffToken(token: string): Promise<JWTPayload & { sub: string; jti: string; exp: number }>;
}

interface Discovery {
  token_endpoint: string;
  jwks_uri: string;
}

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : null);

export class TakatakOidc implements TakatakClient {
  private discovery?: { value: Discovery; at: number };
  private jwks?: JWTVerifyGetKey;
  private readonly fetchImpl: typeof fetch;

  constructor(
    private readonly config: Config,
    private readonly repo: Repository,
    opts: { jwks?: JWTVerifyGetKey; fetch?: typeof fetch } = {},
  ) {
    this.jwks = opts.jwks;
    this.fetchImpl = opts.fetch ?? fetch;
  }

  private get issuer(): string {
    if (!this.config.TAKATAK_ISSUER) throw notConfigured("TAKATAK identity");
    return this.config.TAKATAK_ISSUER.replace(/\/$/, "");
  }

  private async getDiscovery(): Promise<Discovery> {
    if (this.discovery && Date.now() - this.discovery.at < 3600_000) return this.discovery.value;
    const res = await this.fetchImpl(`${this.issuer}/.well-known/openid-configuration`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new HttpError(502, "idp_unavailable", "TAKATAK discovery failed");
    const value = (await res.json()) as Discovery;
    if (!value.token_endpoint || !value.jwks_uri) throw new HttpError(502, "idp_unavailable", "TAKATAK discovery is incomplete");
    this.discovery = { value, at: Date.now() };
    return value;
  }

  private async getJwks(): Promise<JWTVerifyGetKey> {
    if (!this.jwks) {
      const url = this.config.TAKATAK_JWKS_URL ?? (await this.getDiscovery()).jwks_uri;
      this.jwks = createRemoteJWKSet(new URL(url), { cooldownDuration: 30_000, cacheMaxAge: 3600_000 });
    }
    return this.jwks;
  }

  async exchangeCode(input: { code: string; codeVerifier: string; redirectUri: string; nonce?: string }): Promise<TakatakIdentity> {
    const clientId = this.config.TAKATAK_CLIENT_ID;
    if (!clientId) throw notConfigured("TAKATAK identity");
    const allowed = this.config.TAKATAK_REDIRECT_URIS;
    if (allowed.length && !allowed.includes(input.redirectUri)) throw new HttpError(400, "invalid_redirect_uri");

    const { token_endpoint } = await this.getDiscovery();
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: input.redirectUri,
      client_id: clientId,
      code_verifier: input.codeVerifier,
    });
    const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded", accept: "application/json" };
    if (this.config.TAKATAK_CLIENT_SECRET) {
      headers.authorization = "Basic " + Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(this.config.TAKATAK_CLIENT_SECRET)}`).toString("base64");
    }
    const res = await this.fetchImpl(token_endpoint, { method: "POST", headers, body: form, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw unauthorized("TAKATAK rejected the authorization code");
    const tokens = (await res.json()) as { id_token?: string };
    if (!tokens.id_token) throw unauthorized("TAKATAK returned no ID token");

    let claims: JWTPayload;
    try {
      ({ payload: claims } = await jwtVerify(tokens.id_token, await this.getJwks(), {
        issuer: this.issuer,
        audience: clientId,
        algorithms: ALGORITHMS,
        requiredClaims: ["sub", "exp", "iat"],
        clockTolerance: CLOCK_SKEW_S,
      }));
    } catch {
      throw unauthorized("Invalid TAKATAK ID token");
    }
    if (input.nonce !== undefined && claims.nonce !== input.nonce) throw unauthorized("ID token nonce mismatch");
    if (claims.jti && claims.exp && !(await this.repo.useOnce(`idt:${claims.jti}`, new Date(claims.exp * 1000)))) {
      throw unauthorized("ID token already used");
    }
    return {
      globalUserId: claims.sub!,
      email: str(claims.email),
      emailVerified: claims.email_verified === true,
      phoneVerified: claims.phone_number_verified === true || claims.phone_verified === true,
      phone: str(claims.phone_number),
      name: str(claims.name),
      locale: str(claims.locale),
      workspaceId: str(claims.workspace_id),
      businessId: str(claims.business_id),
    };
  }

  async verifyHandoffToken(token: string) {
    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(token, await this.getJwks(), {
        issuer: this.issuer,
        audience: HANDOFF_AUDIENCE,
        algorithms: ALGORITHMS,
        requiredClaims: ["sub", "exp", "iat", "jti"],
        clockTolerance: CLOCK_SKEW_S,
      }));
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw unauthorized("Invalid handoff token");
    }
    const { exp, iat, jti, sub } = payload as Required<Pick<JWTPayload, "exp" | "iat" | "jti" | "sub">>;
    const now = Math.floor(Date.now() / 1000);
    if (exp - iat > HANDOFF_MAX_TTL_S || exp - now > HANDOFF_MAX_TTL_S + CLOCK_SKEW_S) throw unauthorized("Handoff token lifetime too long");
    if (!(await this.repo.useOnce(`handoff:${jti}`, new Date(exp * 1000)))) throw unauthorized("Handoff token already used");
    return { ...payload, sub, jti, exp };
  }
}
