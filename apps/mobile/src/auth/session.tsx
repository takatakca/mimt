import type { MeResponse } from "@mimt/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, hasSession, onSignedOut, setApiLocale, setTokens, signOutLocally } from "../api/client";
import { ApiClientError } from "../api/errors";
import type { AuthTokens } from "../api/types";
import { useI18n } from "../i18n";

type Status = "loading" | "signedOut" | "signedIn";

interface Session {
  status: Status;
  me: MeResponse | null;
  /** Reloads /v1/me (plan, usage, onboarding flags). */
  refreshMe: () => Promise<MeResponse | null>;
  signIn: (tokens: AuthTokens) => Promise<MeResponse | null>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => setApiLocale(locale), [locale]);

  const refreshMe = useCallback(async () => {
    try {
      const next = await api.me();
      setMe(next);
      setStatus("signedIn");
      return next;
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) setStatus("signedOut");
      return null;
    }
  }, []);

  useEffect(() => {
    const off = onSignedOut(() => {
      setMe(null);
      setStatus("signedOut");
    });
    hasSession().then(async (has) => {
      if (!has) return setStatus("signedOut");
      const loaded = await refreshMe();
      // Offline at launch with a stored session: stay signed in, screens retry on their own.
      if (!loaded) setStatus((s) => (s === "loading" ? "signedIn" : s));
    });
    return () => {
      off();
    };
  }, [refreshMe]);

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      await setTokens(tokens);
      setStatus("signedIn");
      return refreshMe();
    },
    [refreshMe],
  );

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined);
    await signOutLocally();
  }, []);

  const value = useMemo<Session>(() => ({ status, me, refreshMe, signIn, signOut }), [status, me, refreshMe, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
