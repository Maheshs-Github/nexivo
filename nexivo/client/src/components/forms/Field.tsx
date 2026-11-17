import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control = "w-full rounded-xl border border-line-strong bg-surface/60 px-4 text-[0.9375rem] text-text placeholder:text-text-muted/70 transition-colors focus:border-brand focus:bg-surface focus:outline-none aria-[invalid=true]:border-danger";

interface FieldProps { id: string; label: string; error?: string; hint?: string; optional?: boolean; children: ReactNode; className?: string }

export function Field({ id, label, error, hint, optional, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}{optional && <span className="ml-1.5 font-normal text-text-muted">(optional)</span>}
      </label>
      {children}
      {error ? <p id={`${id}-error`} role="alert" className="text-sm text-danger">{error}</p> : hint ? <p id={`${id}-hint`} className="text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, id, ...props }, ref) => (
    <input ref={ref} id={id} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} className={cn(control, "h-12", className)} {...props} />
  ),
);
TextInput.displayName = "TextInput";

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, id, ...props }, ref) => (
    <textarea ref={ref} id={id} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} className={cn(control, "min-h-36 resize-y py-3", className)} {...props} />
  ),
);
TextArea.displayName = "TextArea";

/** Hidden from people, irresistible to bots. The API rejects submissions that fill it. */
export function Honeypot({ register }: { register: object }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register} /></label>
    </div>
  );
}

/** Copies API field errors (400 { errors }) onto react-hook-form fields. */
export function applyServerErrors(errors: Record<string, string[]> | undefined, setError: (name: never, e: { message: string }) => void) {
  if (!errors) return false;
  let any = false;
  for (const [name, msgs] of Object.entries(errors)) { if (msgs?.[0]) { setError(name as never, { message: msgs[0] }); any = true; } }
  return any;
}
