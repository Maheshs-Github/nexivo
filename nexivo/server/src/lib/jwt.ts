import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env, isProd } from "../config/env.js";
import type { Role } from "../generated/prisma/enums.js";

export const AUTH_COOKIE = "nx_session";

export interface TokenPayload { sub: number; role: Role }

export const signToken = (payload: TokenPayload) =>
  jwt.sign({ role: payload.role }, env.JWT_SECRET, { subject: String(payload.sub), expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    return { sub: Number(decoded.sub), role: decoded.role as Role };
  } catch {
    return null;
  }
}

export const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
