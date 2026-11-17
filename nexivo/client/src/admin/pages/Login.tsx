import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { loginBody } from "@shared/forms";
import type { ApiError } from "@/lib/api";
import { useSettings } from "@/hooks/usePublic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/Brand";
import { useAuth } from "../lib/auth";
import { FieldShell } from "../components/FormKit";

type Values = z.input<typeof loginBody>;

export default function Login() {
  const { user, loading, login } = useAuth();
  const { data: s } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(loginBody) });

  if (!loading && user) return <Navigate to={from.startsWith("/admin") && !from.startsWith("/admin/login") ? from : "/admin"} replace />;

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);
    try {
      const msg = await login(email, password);
      toast.success(msg ?? "Signed in");
      navigate(from.startsWith("/admin") && !from.startsWith("/admin/login") ? from : "/admin", { replace: true });
    } catch (e) {
      setFormError((e as ApiError).message);
    }
  });

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-4 py-12">
      <div aria-hidden className="hairline-grid mask-radial absolute inset-0 opacity-60" />
      <div aria-hidden className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(closest-side, var(--brand), transparent)" }} />
      <ThemeToggle className="absolute right-4 top-4" />
      <main className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-glow">
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M5 19V5h3l8 9V5h3v14h-3L8 10v9z" /></svg>
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Sign in to {s?.general.siteName ?? "the admin"}</h1>
          <p className="mt-1.5 text-sm text-text-muted">Manage pages, posts, careers and messages.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="glass space-y-4 rounded-2xl p-6">
          {formError && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>}
          <FieldShell id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="username" autoFocus className="h-10" aria-invalid={!!errors.email} {...register("email")} />
          </FieldShell>
          <FieldShell id="password" label="Password" error={errors.password?.message}>
            <div className="relative">
              <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="h-10 pr-10" aria-invalid={!!errors.password} {...register("password")} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:text-text">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FieldShell>
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}{isSubmitting ? "Signing in" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-text-muted"><a href="/" className="hover:text-text">← Back to website</a></p>
      </main>
    </div>
  );
}
