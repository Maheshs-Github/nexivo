import type { ReactNode } from "react";
import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateProps { title: string; text?: string; action?: ReactNode; className?: string }

export function EmptyState({ title, text, action, className, icon }: StateProps & { icon?: ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-11 place-items-center rounded-full bg-surface-2 text-text-muted">{icon ?? <Inbox className="size-5" aria-hidden />}</div>
      <p className="font-display text-lg font-semibold text-text">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "We couldn't load this", text, onRetry, className }: Partial<StateProps> & { onRetry?: () => void }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/40 px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-11 place-items-center rounded-full bg-danger/10 text-danger"><TriangleAlert className="size-5" aria-hidden /></div>
      <p className="font-display text-lg font-semibold text-text">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-text-muted">{text ?? "Please check your connection and try again."}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-text transition hover:bg-surface-2">
          <RefreshCw className="size-4" aria-hidden /> Try again
        </button>
      )}
    </div>
  );
}

export function Shimmer({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-surface-2/70", className)} />;
}
