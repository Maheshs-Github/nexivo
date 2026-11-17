import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "../lib/prisma.js";
import { RESUMES_DIR, UPLOADS_DIR } from "../lib/paths.js";
import { detectFileType, isImage, isPdf } from "../lib/fileType.js";
import { badRequest } from "../utils/http.js";

const randomName = (ext: string) => `${Date.now().toString(36)}-${randomBytes(12).toString("hex")}.${ext}`;
const SAFE_NAME = /^[a-z0-9-]+\.(webp|gif|jpg|png|pdf)$/;

/** Validates an image, converts it to WebP (GIFs stay animated GIFs), writes it to disk and stores the bytes in the DB. */
export async function saveImage(file: Express.Multer.File, alt?: string) {
  const type = detectFileType(file.buffer);
  if (!isImage(type)) throw badRequest("Only JPEG, PNG, WebP or GIF images are allowed");

  let data: Buffer = file.buffer;
  let ext = type!.ext;
  let mimeType: string = type!.mime;
  let width: number | undefined;
  let height: number | undefined;

  try {
    if (type!.mime === "image/gif") {
      const meta = await sharp(file.buffer).metadata();
      width = meta.width; height = meta.pageHeight ?? meta.height;
    } else {
      const out = await sharp(file.buffer).rotate().resize({ width: 2400, withoutEnlargement: true })
        .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
      data = out.data; ext = "webp"; mimeType = "image/webp";
      width = out.info.width; height = out.info.height;
    }
  } catch {
    throw badRequest("This image could not be processed. It may be corrupted.");
  }

  const filename = randomName(ext);
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, filename), data);
  return prisma.media.create({
    data: { url: `/uploads/${filename}`, filename, mimeType, size: data.length, width, height, alt: alt?.slice(0, 255), data: new Uint8Array(data) },
  });
}

/** Validates a resume (real PDF only) and returns the stored file name plus bytes for the DB. */
export async function saveResume(file: Express.Multer.File) {
  if (!isPdf(detectFileType(file.buffer))) throw badRequest("Resume must be a PDF file");
  const filename = randomName("pdf");
  await fs.mkdir(RESUMES_DIR, { recursive: true });
  await fs.writeFile(path.join(RESUMES_DIR, filename), file.buffer);
  return { filename, data: file.buffer };
}

/** Restores an uploaded file from the DB when the disk cache is empty (e.g. after a redeploy). */
export async function restoreUpload(filename: string) {
  if (!SAFE_NAME.test(filename)) return null;
  const media = await prisma.media.findFirst({ where: { filename }, select: { data: true, mimeType: true } });
  if (!media?.data) return null;
  const buf = Buffer.from(media.data);
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buf).catch(() => undefined);
  return { buf, mimeType: media.mimeType };
}

export async function readResume(filename: string, fallback: Uint8Array | null) {
  if (!SAFE_NAME.test(filename)) return fallback ? Buffer.from(fallback) : null;
  try {
    return await fs.readFile(path.join(RESUMES_DIR, filename));
  } catch {
    return fallback ? Buffer.from(fallback) : null;
  }
}

export async function removeUpload(filename: string) {
  if (!SAFE_NAME.test(filename)) return;
  await fs.unlink(path.join(UPLOADS_DIR, filename)).catch(() => undefined);
}
