import { Link } from "react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Wordmark: the uploaded logo if set in Settings, otherwise a typographic mark built from the site name. */
export function Logo({ name, logo, className }: { name?: string; logo?: string; className?: string }) {
  const label = name || "Home";
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)} aria-label={`${label}, home`}>
      {logo ? (
        <img src={logo} alt="" width={120} height={32} className="h-8 w-auto" />
      ) : (
        <>
          <span aria-hidden className="relative grid size-8 place-items-center overflow-hidden rounded-[10px] bg-text text-bg">
            <span className="absolute inset-0 bg-gradient-to-br from-brand to-brand-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg viewBox="0 0 24 24" className="relative size-4" fill="currentColor"><path d="M5 19V5h3l8 9V5h3v14h-3L8 10v9z" /></svg>
          </span>
          <span className="font-display text-[1.05rem] font-semibold tracking-tight text-text">{name?.split(" ")[0]}</span>
        </>
      )}
    </Link>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, toggle } = useTheme();
  const next = mode === "dark" ? "light" : "dark";
  return (
    <button type="button" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}
      className={cn("relative grid size-10 place-items-center rounded-full text-text-muted transition hover:bg-surface-2 hover:text-text", className)}>
      <Sun aria-hidden className={cn("size-[18px] transition-all duration-300", mode === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0")} />
      <Moon aria-hidden className={cn("absolute size-[18px] transition-all duration-300", mode === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100")} />
    </button>
  );
}
