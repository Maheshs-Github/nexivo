import multer from "multer";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** Files are kept in memory so their magic bytes can be checked before anything touches the disk. */
export const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 10 } });
export const resumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_RESUME_BYTES, files: 1, fields: 20 } });
