import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useSettings } from "@/hooks/usePublic";
import { ActionLink } from "@/components/ui/action-link";
import { list, validCta, type SectionProps } from "./shared";
import { Aurora, OrbitArt } from "./HeroArt";

const ease = [0.16, 1, 0.3, 1] as const;

/** Splits the headline into words, marking the ones that belong to the highlighted phrase. */
function words(headline: string, highlight?: string) {
  const hl = (highlight ?? "").trim().toLowerCase();
  const start = hl ? headline.toLowerCase().indexOf(hl) : -1;
  let cursor = 0;
  return headline.split(/\s+/).filter(Boolean).map((w) => {
    const at = headline.indexOf(w, cursor);
    cursor = at + w.length;
    return { w, hl: start >= 0 && at >= start && at < start + hl.length };
  });
}

/** Cursor glow, desktop pointers only; writes CSS variables instead of re-rendering. */
function useCursorGlow(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${e.clientX - r.left}px`);
        el.style.setProperty("--gy", `${e.clientY - r.top}px`);
        el.style.setProperty("--go", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--go", "0");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { cancelAnimationFrame(frame); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, [ref, enabled]);
}

export function Hero({ content: c }: SectionProps<"HERO">) {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { data: settings } = useSettings();
  useCursorGlow(ref, !reduced);
  const headline = c.headline ?? "";
  const announcement = settings?.general.announcement;
  const badges = list(c.badges);

  const rise = (delay: number) => (reduced ? {} : { initial: { opacity: 0.01, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease, delay } });
  const wordDelay = 0.15 + words(headline, c.highlight).length * 0.07;

  return (
    <section ref={ref} className="noise relative isolate -mt-nav overflow-hidden pt-nav">
      <Aurora />
      <div aria-hidden className="hairline-grid mask-radial pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500"
        style={{ opacity: "var(--go, 0)", background: "radial-gradient(600px circle at var(--gx, 50%) var(--gy, 30%), color-mix(in oklab, var(--brand) 14%, transparent), transparent 60%)" }} />
      <OrbitArt reduced={reduced} />

      <div className="container-x relative flex min-h-[min(calc(92svh-var(--nav-h)),56rem)] flex-col justify-center py-20 md:py-28">
        {announcement && (
          <motion.div {...rise(0)}>
            <Link to={settings?.general.announcementUrl || "/blog"}
              className="glass group mb-8 inline-flex max-w-full items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm text-text-muted transition hover:text-text">
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-text">New</span>
              <span className="truncate">{announcement}</span>
              <ArrowRight className="size-3.5 shrink-0 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </motion.div>
        )}
        {c.eyebrow && (
          <motion.p {...rise(0.05)} className="eyebrow mb-6">
            <span className="relative flex size-2"><span className="absolute inset-0 animate-pulse-dot rounded-full bg-brand-2" /></span>
            {c.eyebrow}
          </motion.p>
        )}

        <h1 className="max-w-[14ch] text-display font-semibold sm:max-w-[16ch]" aria-label={headline}>
          {words(headline, c.highlight).map(({ w, hl }, i) => (
            <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span className={hl ? "text-gradient inline-block" : "inline-block"}
                initial={reduced ? false : { y: "0.35em", opacity: 0.01, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.07 }}>
                {w}
              </motion.span>
              {" "}
            </span>
          ))}
        </h1>

        {c.subheadline && <motion.p {...rise(wordDelay)} className="lead mt-7 max-w-2xl">{c.subheadline}</motion.p>}

        <motion.div {...rise(wordDelay + 0.1)} className="mt-10 flex flex-wrap items-center gap-3">
          {validCta(c.primaryCta) && <ActionLink href={c.primaryCta.href} size="lg" arrow>{c.primaryCta.label}</ActionLink>}
          {validCta(c.secondaryCta) && <ActionLink href={c.secondaryCta.href} size="lg" variant="secondary">{c.secondaryCta.label}</ActionLink>}
        </motion.div>

        {(c.trustNote || badges.length > 0) && (
          <motion.div {...rise(wordDelay + 0.25)} className="mt-16 flex flex-col gap-5 border-t border-line pt-6 md:mt-24 md:flex-row md:items-center md:justify-between">
            {c.trustNote && <p className="text-sm text-text-muted">{c.trustNote}</p>}
            {badges.length > 0 && (
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-text">
                {badges.map((b, i) => (
                  <li key={i} className="inline-flex items-center gap-2">
                    <span aria-hidden className="size-1 rounded-full bg-brand-2" />{b}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
