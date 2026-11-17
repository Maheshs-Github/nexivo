import type { ReactNode } from "react";
import type { SectionContent, SectionType } from "@shared/sections";
import { cn } from "@/lib/utils";

/** Motion-free section primitives (kept separate so above-the-fold headers never pull in the animation library). */
export type Content<T extends SectionType> = Partial<SectionContent<T>>;

export interface SectionProps<T extends SectionType, D = unknown> { content: Content<T>; data?: D; index: number }

export const list = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value.filter(Boolean) : []);
export const validCta = (c?: { label?: string; href?: string } | null): c is { label: string; href: string } => !!c?.label && !!c?.href;

export function Eyebrow({ index, children, className }: { index?: number; children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p className={cn("eyebrow", className)}>
      {!!index && <span className="eyebrow-index">{String(index).padStart(2, "0")}</span>}
      {!!index && <span aria-hidden className="eyebrow-rule" />}
      <span>{children}</span>
    </p>
  );
}
