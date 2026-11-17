import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Img } from "@/components/ui/img";
import { cn } from "@/lib/utils";
import { Eyebrow, list, type SectionProps } from "./shared";

/**
 * Accessible carousel (WAI-ARIA APG): labelled region, live announcement, prev/next buttons,
 * tab-style pickers and arrow-key navigation. No autoplay, so nothing moves without the visitor.
 */
export function Testimonials({ content: c, data, index }: SectionProps<"TESTIMONIALS", Testimonial[]>) {
  const items = list(data);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  if (!items.length) return null;
  const go = (i: number) => setActive((i + items.length) % items.length);
  const t = items[active];
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  };

  return (
    <section className="section overflow-hidden">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Eyebrow index={index}>{c.eyebrow}</Eyebrow>
          {c.heading && <h2 className="mt-4 text-h2 font-semibold">{c.heading}</h2>}
          {c.subheading && <p className="lead mt-5">{c.subheading}</p>}
          {items.length > 1 && (
            <div className="mt-10 flex items-center gap-2">
              <button type="button" onClick={() => go(active - 1)} aria-label="Previous testimonial" className="grid size-11 place-items-center rounded-full border border-line-strong transition hover:bg-surface-2">
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button type="button" onClick={() => go(active + 1)} aria-label="Next testimonial" className="grid size-11 place-items-center rounded-full border border-line-strong transition hover:bg-surface-2">
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <span className="ml-3 font-mono text-sm tabular-nums text-text-muted">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>
          )}
        </div>

        <div role="region" aria-roledescription="carousel" aria-label={c.heading || "Testimonials"} onKeyDown={onKey} className="lg:col-span-7 lg:col-start-6">
          <div aria-live="polite" className="relative min-h-[18rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure key={t.id} role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${items.length}`}
                initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <div className="flex gap-1 text-brand-2" aria-label={`Rated ${t.rating} out of 5`} role="img">
                  {Array.from({ length: t.rating }, (_, i) => <Star key={i} className="size-4 fill-current" aria-hidden />)}
                </div>
                <blockquote className="mt-6 font-display text-quote font-medium leading-snug tracking-tight text-text">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <Img src={t.avatar} alt="" width={48} height={48} className="size-12 rounded-full border border-line" />
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-text-muted">{t.role}, {t.company}</p>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          {items.length > 1 && (
            <div role="tablist" aria-label="Choose a testimonial" className="mt-10 flex gap-2">
              {items.map((it, i) => (
                <button key={it.id} type="button" role="tab" aria-selected={i === active} aria-label={`${it.name}, ${it.company}`} onClick={() => go(i)}
                  className="group flex h-6 flex-1 items-center">
                  <span className={cn("h-0.5 w-full rounded-full transition-colors", i === active ? "bg-brand-text" : "bg-line-strong group-hover:bg-text-muted")} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
