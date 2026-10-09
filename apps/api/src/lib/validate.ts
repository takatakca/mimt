import type { z } from "zod";
import { HttpError } from "./errors.js";

export function parse<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const r = schema.safeParse(data);
  if (!r.success) {
    const message = r.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
    throw new HttpError(400, "invalid_request", message);
  }
  return r.data;
}
