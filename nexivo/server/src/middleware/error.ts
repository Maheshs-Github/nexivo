import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../utils/http.js";
import { isProd } from "../config/env.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
};

function zodFieldErrors(err: ZodError) {
  const errors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    if (!isProd) console.warn(`[validation error] ${req.method} ${req.path}:`, zodFieldErrors(err));
    return res.status(400).json({ success: false, message: "Please check the highlighted fields", errors: zodFieldErrors(err) });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message, ...(err.errors ? { errors: err.errors } : {}) });
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : `Upload error: ${err.message}`;
    return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, message: msg });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Record not found" });
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "A record with this value already exists" });
    if (err.code === "P2003") return res.status(409).json({ success: false, message: "This record is still in use and cannot be removed" });
  }
  if (err?.type === "entity.too.large") return res.status(413).json({ success: false, message: "Request body is too large" });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Malformed JSON body" });

  console.error(`[error] ${req.method} ${req.path}:`, isProd ? err?.message : err);
  return res.status(500).json({ success: false, message: "Something went wrong on our side. Please try again." });
};
