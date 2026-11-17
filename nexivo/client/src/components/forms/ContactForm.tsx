import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { contactBody } from "@shared/forms";
import { api, type ApiError } from "@/lib/api";
import { useSettings } from "@/hooks/usePublic";
import { Field, Honeypot, TextArea, TextInput, applyServerErrors } from "./Field";

type Values = z.input<typeof contactBody>;

export default function ContactForm() {
  const { data: s } = useSettings();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(contactBody) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await api.post("/contact", values);
      toast.success(res.message ?? "Message sent");
      reset();
      setSent(true);
    } catch (err) {
      const e = err as ApiError;
      if (!applyServerErrors(e.errors, setError as never)) toast.error(e.message);
    }
  });

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start rounded-3xl border border-line bg-surface/50 p-8 md:p-12">
        <span className="grid size-14 place-items-center rounded-full bg-success/15 text-success"><CircleCheck className="size-7" aria-hidden /></span>
        <h2 className="mt-6 text-h3 font-semibold">{s?.pages.contactSuccessTitle || "Message sent"}</h2>
        <p className="mt-3 max-w-md text-text-muted">{s?.pages.contactSuccessText}</p>
        <button type="button" onClick={() => setSent(false)} className="mt-8 text-sm font-medium text-brand-text hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-3xl border border-line bg-surface/40 p-6 md:p-10" aria-labelledby="contact-form-title">
      <Honeypot register={register("website")} />
      <h2 id="contact-form-title" className="text-h3 font-semibold">{s?.pages.contactFormHeading || "Send us a message"}</h2>
      {s?.pages.contactFormText && <p className="mt-2 text-text-muted">{s.pages.contactFormText}</p>}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id="ct-name" label="Name" error={errors.name?.message}><TextInput id="ct-name" autoComplete="name" invalid={!!errors.name} {...register("name")} /></Field>
        <Field id="ct-email" label="Work email" error={errors.email?.message}><TextInput id="ct-email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} /></Field>
        <Field id="ct-company" label="Company" optional error={errors.company?.message}><TextInput id="ct-company" autoComplete="organization" invalid={!!errors.company} {...register("company")} /></Field>
        <Field id="ct-phone" label="Phone" optional error={errors.phone?.message}><TextInput id="ct-phone" type="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} /></Field>
        <Field id="ct-subject" label="Subject" error={errors.subject?.message} className="sm:col-span-2"><TextInput id="ct-subject" invalid={!!errors.subject} {...register("subject")} /></Field>
        <Field id="ct-message" label="How can we help?" error={errors.message?.message} className="sm:col-span-2">
          <TextArea id="ct-message" rows={6} invalid={!!errors.message} placeholder="Goals, timeline, budget range, anything useful" {...register("message")} />
        </Field>
      </div>
      <button type="submit" disabled={isSubmitting} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-strong px-7 font-medium text-white transition hover:shadow-glow disabled:opacity-60 sm:w-auto">
        {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}{isSubmitting ? "Sending" : "Send message"}
      </button>
    </form>
  );
}

