/** Detects a file type from its first bytes. The browser-sent mimetype is never trusted. */
export type Detected = { mime: "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf"; ext: string };

const startsWith = (buf: Buffer, bytes: number[], offset = 0) => bytes.every((b, i) => buf[offset + i] === b);
const ascii = (buf: Buffer, start: number, end: number) => buf.subarray(start, end).toString("latin1");

export function detectFileType(buf: Buffer): Detected | null {
  if (buf.length < 12) return null;
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  if (ascii(buf, 0, 6) === "GIF87a" || ascii(buf, 0, 6) === "GIF89a") return { mime: "image/gif", ext: "gif" };
  if (ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(buf, 0, 5) === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  return null;
}

export const isImage = (d: Detected | null) => !!d && d.mime.startsWith("image/");
export const isPdf = (d: Detected | null) => d?.mime === "application/pdf";
