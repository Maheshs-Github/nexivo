import { useRef, useState, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { applyBody } from "@shared/forms";
import { ApiError, upload } from "@/lib/api";
import { useSettings } from "@/hooks/usePublic";
import { cn } from "@/lib/utils";
import { Field, Honeypot, TextArea, TextInput, applyServerErrors } from "./Field";

const MAX = 5 * 1024 * 1024;
type Values = z.input<typeof applyBody>;

/** Checks type and size in the browser too (the API re-checks the real file bytes). */
function checkFile(f: File) {
  const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Please upload your resume as a PDF.";
  if (f.size > MAX) return `That file is ${(f.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`;
  return null;
}

export function ApplyForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const { data: settings } = useSettings();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(applyBody) });

  const pick = (f?: File | null) => {
    if (!f) return;
    const err = checkFile(f);
    setFileError(err);
    setFile(err ? null : f);
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); };

  const onSubmit = handleSubmit(async (values) => {
    if (!file) { setFileError("Please attach your resume (PDF, max 5 MB)."); return; }
    const form = new FormData();
    for (const [k, v] of Object.entries(values)) if (v) form.append(k, String(v));
    form.append("resume", file);
    try {
      setProgress(0);
      const res = await upload(`/jobs/${jobId}/apply`, form, setProgress);
      setDone(true);
      toast.success(res.message ?? "Application sent");
    } catch (err) {
      const e = err as ApiError;
      if (!applyServerErrors(e.errors, setError as never)) toast.error(e.message);
      if (e.errors?.resume) setFileError(e.errors.resume[0]);
    } finally {
      setProgress(null);
    }
  });

  if (done) {
    return (
      <div role="status" className="rounded-3xl border border-line bg-surface/50 p-8 text-center md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success"><CircleCheck className="size-7" aria-hidden /></span>
        <h3 className="mt-6 text-h3 font-semibold">{settings?.pages.applySuccessTitle || "Application received"}</h3>
        <p className="mx-auto mt-3 max-w-md text-text-muted">{settings?.pages.applySuccessText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5" aria-label={`Apply for ${jobTitle}`}>
      <Honeypot register={register("website")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="ap-name" label="Full name" error={errors.name?.message}><TextInput id="ap-name" autoComplete="name" invalid={!!errors.name} {...register("name")} /></Field>
        <Field id="ap-email" label="Email" error={errors.email?.message}><TextInput id="ap-email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} /></Field>
        <Field id="ap-phone" label="Phone" optional error={errors.phone?.message}><TextInput id="ap-phone" type="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} /></Field>
        <Field id="ap-linkedin" label="LinkedIn or portfolio" optional error={errors.linkedin?.message}><TextInput id="ap-linkedin" type="url" placeholder="https://" invalid={!!errors.linkedin} {...register("linkedin")} /></Field>
      </div>

      <Field id="ap-resume" label="Resume" error={fileError ?? undefined} hint="PDF only, up to 5 MB">
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
          className={cn("relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-9 text-center transition-colors",
            dragging ? "border-brand bg-brand-soft" : fileError ? "border-danger" : "border-line-strong bg-surface/40")}>
          {file ? (
            <div className="flex w-full items-center gap-3 text-left">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-text"><FileText className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB</p></div>
              <button type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }} aria-label="Remove file" className="grid size-9 place-items-center rounded-full hover:bg-surface-2"><X className="size-4" aria-hidden /></button>
            </div>
          ) : (
            <>
              <Upload className="size-6 text-text-muted" aria-hidden />
              <p className="text-sm"><button type="button" onClick={() => inputRef.current?.click()} className="font-medium text-brand-text underline-offset-4 hover:underline">Choose a file</button> or drag it here</p>
            </>
          )}
          <input ref={inputRef} id="ap-resume" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-invalid={!!fileError || undefined} />
        </div>
      </Field>

      <Field id="ap-cover" label="Why this role?" optional error={errors.coverLetter?.message}>
        <TextArea id="ap-cover" rows={5} invalid={!!errors.coverLetter} placeholder="A few lines about you and what you'd like to work on" {...register("coverLetter")} />
      </Field>

      {progress !== null && (
        <div aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[width]" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-xs text-text-muted">Uploading… {progress}%</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-medium text-white transition hover:shadow-glow disabled:opacity-60 sm:w-auto">
        {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}{isSubmitting ? "Sending application" : "Submit application"}
      </button>
    </form>
  );
}
