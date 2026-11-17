import type { PointerEvent } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { Img } from "@/components/ui/img";
import { ActionLink } from "@/components/ui/action-link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { revealVariants } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { SectionIntro, list, validCta, type SectionProps } from "./shared";

/** Cursor-following glow: writes the pointer position into --mx/--my on the hovered card. */
function trackPointer(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

// Bento layout for 6 items on lg (6 columns): one feature tile, then a rhythm of tall and wide tiles.
const LAYOUT = ["lg:col-span-4 lg:row-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];

function ServiceCard({ s, i }: { s: Service; i: number }) {
  const featured = i === 0;
  return (
    <StaggerItem variants={revealVariants} className={cn("min-h-[15rem]", LAYOUT[i % LAYOUT.length])}>
      <Link to={`/services/${s.slug}`} onPointerMove={trackPointer}
        className="spotlight group flex h-full flex-col rounded-2xl border border-line bg-surface/50 p-6 transition-colors duration-300 hover:border-line-strong md:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 place-items-center rounded-xl border border-line bg-bg/60 text-brand-text">
            <Icon name={s.icon} className="size-5" />
          </span>
          <ArrowUpRight aria-hidden className="size-5 text-text-muted transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text" />
        </div>
        <h3 className={cn("mt-6 font-semibold", featured ? "text-h3 md:text-[1.75rem] md:tracking-tight" : "text-h3")}>{s.title}</h3>
        <p className={cn("mt-2.5 text-text-muted", featured ? "max-w-md text-base" : "text-sm leading-relaxed")}>{s.shortDesc}</p>
        {featured && list(s.features).length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {list(s.features).slice(0, 4).map((f) => <li key={f} className="rounded-full border border-line px-3 py-1 text-xs text-text-muted">{f}</li>)}
          </ul>
        )}
        {featured && s.image && (
          <div className="relative mt-8 hidden flex-1 overflow-hidden rounded-xl border border-line lg:block">
            <Img src={s.image} alt="" width={1600} height={900} className="absolute inset-0 size-full transition duration-700 ease-out-expo group-hover:scale-[1.03]" />
          </div>
        )}
      </Link>
    </StaggerItem>
  );
}

export function ServicesBento({ content: c, data, index }: SectionProps<"SERVICES", Service[]>) {
  const services = list(data);
  if (!services.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index}
          action={validCta(c.cta) ? <ActionLink href={c.cta.href} variant="secondary" arrow>{c.cta.label}</ActionLink> : undefined} />
        <Stagger className="grid auto-rows-[minmax(15rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => <ServiceCard key={s.id} s={s} i={i} />)}
        </Stagger>
      </div>
    </section>
  );
}
