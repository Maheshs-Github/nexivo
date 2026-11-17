import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.resolve(here, "../..");
export const UPLOADS_DIR = path.join(SERVER_ROOT, "uploads");
export const RESUMES_DIR = path.join(SERVER_ROOT, "private", "resumes");
export const CLIENT_DIST = path.resolve(SERVER_ROOT, "../client/dist");
