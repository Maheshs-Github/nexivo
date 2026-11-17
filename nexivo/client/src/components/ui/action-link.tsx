import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const actionStyles = cva(
  "group/btn inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background,box-shadow,color,border-color,transform] duration-150 ease-out-expo active:translate-y-px disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand-strong text-white shadow-soft hover:shadow-glow hover:bg-[color-mix(in_oklab,var(--brand-strong)_90%,white)]",
        secondary: "border border-line-strong bg-surface/60 text-text backdrop-blur hover:border-text-muted/40 hover:bg-surface-2",
        ghost: "text-text hover:bg-surface-2",
        link: "px-0 text-brand-text underline-offset-4 hover:underline",
      },
      size: { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-[0.9375rem]", lg: "h-12 px-6 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = VariantProps<typeof actionStyles> & { href: string; children: ReactNode; className?: string; arrow?: boolean };

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/** Link styled as a button. Internal paths use the router; external ones open safely. */
export function ActionLink({ href, children, className, arrow, variant, size }: Props) {
  const inner = (
    <>
      {children}
      {arrow && <ArrowRight aria-hidden className="size-4 transition-transform duration-150 group-hover/btn:translate-x-0.5" />}
    </>
  );
  const cls = cn(actionStyles({ variant, size }), className);
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return <a href={href} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>;
  }
  return <Link to={href} className={cls}>{inner}</Link>;
}

/** Text link that is internal or external depending on the href. */
export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (isExternal(href)) return <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
  return <Link to={href} className={className}>{children}</Link>;
}
