// Session tokens live in the OS keychain/keystore (expo-secure-store), never in AsyncStorage.
import * as SecureStore from "expo-secure-store";
import type { AuthTokens } from "./types";

const KEY = "mimt.session";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: number;
}

export function toSession(t: AuthTokens, now = Date.now()): StoredSession {
  return { accessToken: t.accessToken, refreshToken: t.refreshToken, expiresAt: now + t.expiresIn * 1000 };
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function saveSession(s: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(s), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
}
