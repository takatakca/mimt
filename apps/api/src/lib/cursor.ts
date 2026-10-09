import { badRequest } from "./errors.js";

/** Opaque keyset cursor "(timestamp, id)" for newest-first lists. */
export const encodeCursor = (at: Date, id: string) => Buffer.from(`${at.toISOString()}|${id}`).toString("base64url");

export function decodeCursor(cursor: string): { at: Date; id: string } {
  const [iso, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
  const at = new Date(iso ?? "");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id) || Number.isNaN(at.getTime())) throw badRequest("invalid_cursor");
  return { at, id };
}
