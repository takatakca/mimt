// "Continuer avec TAKATAK": OAuth 2.0 authorization code + PKCE (docs/MIMT-MVP.md §4, flow A).
// The app never sees a client secret: it sends the one-time code and the PKCE verifier to the MIMT
// API, which exchanges them with TAKATAK server-to-server and verifies the ID token.
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { ApiClientError } from "../api/errors";
import type { AuthTokens } from "../api/types";
import type { TKey } from "../i18n";

WebBrowser.maybeCompleteAuthSession();

const ISSUER = process.env.EXPO_PUBLIC_TAKATAK_ISSUER ?? "";
const CLIENT_ID = process.env.EXPO_PUBLIC_TAKATAK_CLIENT_ID ?? "";
export const takatakConfigured = ISSUER.length > 0 && CLIENT_ID.length > 0;

export function useTakatakSignIn(locale: string, onTokens: (t: AuthTokens) => Promise<unknown>) {
  const [discovery, setDiscovery] = useState<AuthSession.DiscoveryDocument | null>(null);
  useEffect(() => {
    if (!takatakConfigured) return;
    let alive = true;
    AuthSession.fetchDiscoveryAsync(ISSUER)
      .then((d) => alive && setDiscovery(d))
      .catch(() => undefined); // Offline: start() reports a network error below.
    return () => {
      alive = false;
    };
  }, []);
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "mimt", path: "oauthredirect" });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      scopes: ["openid", "profile", "email", "phone"],
      extraParams: { ui_locales: locale },
    },
    discovery,
  );
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<TKey | null>(null);

  useEffect(() => {
    if (!response) return;
    if (response.type === "success" && request?.codeVerifier) {
      const code = response.params.code;
      if (!code) return setErrorKey("error.generic");
      setBusy(true);
      api
        .takatakExchange({ code, codeVerifier: request.codeVerifier, redirectUri })
        .then(onTokens)
        .catch((e) => setErrorKey(e instanceof ApiClientError ? e.key : "error.generic"))
        .finally(() => setBusy(false));
    } else if (response.type === "cancel" || response.type === "dismiss") {
      setErrorKey("signin.cancelled");
    } else if (response.type === "error") {
      setErrorKey("error.generic");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const start = useCallback(async () => {
    if (!takatakConfigured) return setErrorKey("signin.notConfigured");
    if (!request) return setErrorKey("error.network");
    setErrorKey(null);
    await promptAsync();
  }, [request, promptAsync]);

  return { start, ready: takatakConfigured && !!request, busy, errorKey };
}
