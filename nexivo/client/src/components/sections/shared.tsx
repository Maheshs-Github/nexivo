import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./primitives";

export * from "./primitives";

/** Asymmetric section intro: eyebrow + heading on the left (5 cols), lead on the right (7 cols), bottom-aligned. */
export function SectionIntro({ eyebrow, heading, subheading, index, action, align = "split" }: {
  eyebrow?: string; heading?: string; subheading?: string; index?: number; action?: ReactNode; align?: "split" | "stack";
}) {
  if (!heading && !eyebrow) return null;
  return (
    <Reveal className={cn("mb-12 grid gap-6 md:mb-16", align === "split" && "lg:grid-cols-12 lg:items-end lg:gap-10")}>
      <div className={cn(align === "split" && "lg:col-span-6")}>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        {heading && <h2 className="mt-4 text-h2 font-semibold">{heading}</h2>}
      </div>
      {(subheading || action) && (
        <div className={cn("flex flex-col items-start gap-5", align === "split" && "lg:col-span-5 lg:col-start-8")}>
          {subheading && <p className="lead">{subheading}</p>}
          {action}
        </div>
      )}
    </Reveal>
  );
}

export function SectionShell({ children, className, band, id }: { children: ReactNode; className?: string; band?: boolean; id?: string }) {
  return (
    <section id={id} className={cn("section", band && "border-y border-line bg-bg-elevated", className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}
