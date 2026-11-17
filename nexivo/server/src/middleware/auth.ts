import type { RequestHandler } from "express";
import { AUTH_COOKIE, verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http.js";
import type { Role } from "../generated/prisma/enums.js";

export interface AuthUser { id: number; name: string; email: string; role: Role; avatar: string | null; title: string | null }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: AuthUser } }
}

/** Requires a valid session cookie and a user that still exists (deleted users lose access immediately). */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];
  const payload = token ? verifyToken(token) : null;
  if (!payload) throw new HttpError(401, "Please sign in to continue");
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, avatar: true, title: true },
  });
  if (!user) throw new HttpError(401, "Your session has expired. Please sign in again");
  req.user = user;
  next();
};

export const requireRole = (...roles: Role[]): RequestHandler => (req, _res, next) => {
  if (!req.user) throw new HttpError(401, "Please sign in to continue");
  if (!roles.includes(req.user.role)) throw new HttpError(403, "You do not have permission to do that");
  next();
};
