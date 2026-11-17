import type { Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new HttpError(404, `${what} not found`);
export const badRequest = (message: string, errors?: Record<string, string[]>) => new HttpError(400, message, errors);

export function ok<T>(res: Response, data: T, status = 200, message?: string) {
  return res.status(status).json({ success: true, data, ...(message ? { message } : {}) });
}

export function done(res: Response, message: string, status = 200) {
  return res.status(status).json({ success: true, message });
}
