import type { RequestHandler } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { applyBody, contactBody } from "../schemas/forms.js";
import { saveResume } from "../services/storage.service.js";
import { HttpError, badRequest, done } from "../utils/http.js";
import { stripTags } from "../utils/sanitize.js";

export const contact: RequestHandler = async (req, res) => {
  const body = req.body as z.infer<typeof contactBody>;
  await prisma.contactMessage.create({
    data: {
      name: stripTags(body.name), email: body.email.toLowerCase(), phone: body.phone, company: body.company ? stripTags(body.company) : null,
      subject: stripTags(body.subject), message: stripTags(body.message),
    },
  });
  done(res, "Thanks! Your message is with our team.", 201);
};

/** Multipart: fields are validated with Zod after multer parsed them; the resume must be a real PDF (magic bytes). */
export const apply: RequestHandler = async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: Number(req.params.id) }, select: { id: true, status: true } });
  if (!job) throw new HttpError(404, "Job not found");
  if (job.status !== "OPEN") throw new HttpError(410, "This position is closed and no longer accepts applications");

  const body = applyBody.parse(req.body ?? {});
  if (!req.file) throw badRequest("Please attach your resume (PDF, max 5 MB)", { resume: ["Resume is required"] });
  const resume = await saveResume(req.file);

  await prisma.application.create({
    data: {
      jobId: job.id, name: stripTags(body.name), email: body.email.toLowerCase(), phone: body.phone, linkedin: body.linkedin,
      coverLetter: body.coverLetter ? stripTags(body.coverLetter) : null, resumeUrl: resume.filename, resumeData: new Uint8Array(resume.data),
    },
  });
  done(res, "Application received. We will get back to you soon.", 201);
};
