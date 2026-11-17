import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Toolbar button with a tooltip and pressed state. */
export function Toggle({ label, shortcut, active, disabled, onClick, children }: {
  label: string; shortcut?: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} aria-pressed={active ?? undefined} disabled={disabled} onClick={onClick}
          className={cn("grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4",
            active && "bg-brand-soft text-brand-text")}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}{shortcut && <span className="ml-2 opacity-60">{shortcut}</span>}</TooltipContent>
    </Tooltip>
  );
}
