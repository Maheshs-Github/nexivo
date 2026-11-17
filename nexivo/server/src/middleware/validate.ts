import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

/**
 * Validates and replaces req[source] with the parsed (coerced, stripped) value.
 * Express 5 makes req.query a getter, so parsed query/params are stored on res.locals and req via defineProperty.
 */
export function validate(schema: ZodType, source: Source = "body"): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.parse(source === "body" ? (req.body ?? {}) : req[source]);
    Object.defineProperty(req, source, { value: parsed, writable: true, configurable: true, enumerable: true });
    next();
  };
}
