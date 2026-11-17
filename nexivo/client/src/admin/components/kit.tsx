import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, crumbs }: { title: string; description?: string; actions?: ReactNode; crumbs?: { label: string; to?: string }[] }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" aria-hidden />}
                {c.to ? <Link to={c.to} className="hover:text-text">{c.label}</Link> : <span>{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate font-display text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  green: "bg-success/12 text-success ring-success/25",
  amber: "bg-warning/12 text-warning ring-warning/25",
  blue: "bg-brand-soft text-brand-text ring-brand/25",
  red: "bg-danger/12 text-danger ring-danger/25",
  gray: "bg-surface-2 text-text-muted ring-line-strong",
} as const;

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  PUBLISHED: "green", DRAFT: "gray", OPEN: "green", CLOSED: "gray", NEW: "blue", REVIEWING: "amber", SHORTLISTED: "green",
  REJECTED: "red", HIRED: "green", VISIBLE: "green", HIDDEN: "gray", ADMIN: "blue", EDITOR: "gray", UNREAD: "blue", READ: "gray",
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  const tone = TONES[STATUS_TONE[status] ?? "gray"];
  return (
    <span className={cn("inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium ring-1 ring-inset", tone, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </span>
  );
}

/** Confirmation for destructive actions. `onConfirm` may be async; the dialog stays open until it settles. */
export function ConfirmDialog({ trigger, title, description, confirmLabel = "Delete", onConfirm, destructive = true }: {
  trigger: ReactNode; title: string; description?: string; confirmLabel?: string; onConfirm: () => unknown | Promise<unknown>; destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={busy} variant={destructive ? "destructive" : "default"}
            onClick={async (e) => { e.preventDefault(); setBusy(true); try { await onConfirm(); setOpen(false); } finally { setBusy(false); } }}>
            {busy ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Panel({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-line bg-surface/40", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
          <div>{title && <h2 className="text-sm font-semibold">{title}</h2>}{description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}</div>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
