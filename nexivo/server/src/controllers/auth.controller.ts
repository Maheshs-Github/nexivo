import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AUTH_COOKIE, cookieOptions, signToken } from "../lib/jwt.js";
import { HttpError, done, ok } from "../utils/http.js";
import type { z } from "zod";
import type { loginBody, profileBody } from "../schemas/forms.js";

const INVALID = "Invalid email or password";
// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("timing-equaliser-not-a-password", 12);

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginBody>;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, omit: { passwordHash: false } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, INVALID);

  res.cookie(AUTH_COOKIE, signToken({ sub: user.id, role: user.role }), cookieOptions());
  const { passwordHash: _omit, ...safe } = user;
  ok(res, safe, 200, `Welcome back, ${user.name.split(" ")[0]}`);
};

export const logout: RequestHandler = (_req, res) => {
  const { maxAge: _m, ...opts } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, opts);
  done(res, "Signed out");
};

export const me: RequestHandler = (req, res) => ok(res, req.user);

export const updateProfile: RequestHandler = async (req, res) => {
  const body = req.body as z.infer<typeof profileBody>;
  const data: Record<string, unknown> = { name: body.name, title: body.title, bio: body.bio, avatar: body.avatar };
  if (body.newPassword) {
    const current = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, select: { passwordHash: true } });
    if (!body.currentPassword || !(await bcrypt.compare(body.currentPassword, current.passwordHash))) {
      throw new HttpError(400, "Current password is incorrect", { currentPassword: ["Current password is incorrect"] });
    }
    data.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }
  ok(res, await prisma.user.update({ where: { id: req.user!.id }, data }), 200, "Profile updated");
};
