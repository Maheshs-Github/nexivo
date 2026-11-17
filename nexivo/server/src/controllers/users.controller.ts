import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { userCreateBody, userUpdateBody } from "../schemas/forms.js";
import { HttpError, done, notFound, ok } from "../utils/http.js";

const select = { id: true, name: true, email: true, role: true, title: true, avatar: true, createdAt: true, _count: { select: { posts: true } } } as const;

export const list: RequestHandler = async (_req, res) => ok(res, await prisma.user.findMany({ select, orderBy: { createdAt: "asc" } }));

export const create: RequestHandler = async (req, res) => {
  const b = req.body as z.infer<typeof userCreateBody>;
  const user = await prisma.user.create({
    data: { name: b.name, email: b.email.toLowerCase(), role: b.role, title: b.title, bio: b.bio, avatar: b.avatar, passwordHash: await bcrypt.hash(b.password, 12) },
    select,
  });
  ok(res, user, 201, "User created");
};

async function adminCount() {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

export const update: RequestHandler = async (req, res) => {
  const targetId = Number(req.params.id);
  const b = req.body as z.infer<typeof userUpdateBody>;
  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { role: true } });
  if (!target) throw notFound("User");
  if (target.role === "ADMIN" && b.role === "EDITOR" && (await adminCount()) <= 1) throw new HttpError(400, "There must be at least one admin");
  if (targetId === req.user!.id && b.role === "EDITOR") throw new HttpError(400, "You cannot remove your own admin role");

  const data: Record<string, unknown> = {};
  for (const key of ["name", "role", "title", "bio", "avatar"] as const) if (b[key] !== undefined) data[key] = b[key];
  if (b.email) data.email = b.email.toLowerCase();
  if (b.password) data.passwordHash = await bcrypt.hash(b.password, 12);
  ok(res, await prisma.user.update({ where: { id: targetId }, data, select }), 200, "User saved");
};

export const remove: RequestHandler = async (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.user!.id) throw new HttpError(400, "You cannot delete your own account");
  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { role: true } });
  if (!target) throw notFound("User");
  if (target.role === "ADMIN" && (await adminCount()) <= 1) throw new HttpError(400, "You cannot delete the last admin");
  await prisma.user.delete({ where: { id: targetId } });
  done(res, "User deleted");
};
