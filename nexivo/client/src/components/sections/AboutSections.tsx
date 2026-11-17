import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { TeamMember } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { Img } from "@/components/ui/img";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow, SectionIntro, list, type SectionProps } from "./shared";

export function Story({ content: c, index }: SectionProps<"STORY">) {
  const paragraphs = list(c.paragraphs);
  const highlights = list(c.highlights);
  return (
    <section className="section">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <Eyebrow index={index}>{c.eyebrow}</Eyebrow>
          {c.heading && <h2 className="mt-4 text-h2 font-semibold">{c.heading}</h2>}
          {c.image && (
            <div className="mt-10 overflow-hidden rounded-3xl border border-line">
              <Img src={c.image} alt={c.imageAlt || ""} width={1600} height={900} className="aspect-[4/3] w-full" />
            </div>
          )}
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7 lg:pt-16">
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}><p className={i === 0 ? "text-lead text-text" : "mt-6 text-text-muted"}>{p}</p></Reveal>
          ))}
          {highlights.length > 0 && (
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-8">
              {highlights.map((h, i) => (
                <div key={i} className="flex flex-col-reverse gap-1.5">
                  <dt className="text-sm text-text-muted">{h.label}</dt>
                  <dd className="font-display text-h3-lg font-semibold tracking-tight">{h.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

export function MissionVision({ content: c, index }: SectionProps<"MISSION_VISION">) {
  const blocks = [{ label: "Mission", text: c.mission }, { label: "Vision", text: c.vision }].filter((b) => b.text);
  if (!blocks.length) return null;
  return (
    <section className="section border-y border-line bg-bg-elevated">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index} />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.08} className="bg-bg-elevated p-8 md:p-12">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-text">{b.label}</p>
              <p className="mt-5 font-display text-quote font-medium leading-snug tracking-tight">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Values({ content: c, index }: SectionProps<"VALUES">) {
  const items = list(c.items);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index} />
        <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {items.map((v, i) => (
            <Reveal key={i} delay={i * 0.06} className="border-b border-line py-8 sm:px-6 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pl-0 lg:border-b-0 lg:px-6 lg:first:pl-0 lg:[&:not(:last-child)]:border-r">
              <Icon name={v.icon} className="size-6 text-brand-text" />
              <h3 className="mt-6 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{v.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Timeline with a progress line that fills as the visitor scrolls through it. */
export function Timeline({ content: c, index }: SectionProps<"TIMELINE">) {
  const items = list(c.items);
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index} />
        <ol ref={ref} className="relative ml-2 md:ml-0">
          <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line md:left-[9.5rem]" />
          <motion.span aria-hidden style={reduced ? undefined : { scaleY }} className="absolute bottom-0 left-0 top-0 w-px origin-top bg-gradient-to-b from-brand to-brand-2 md:left-[9.5rem]" />
          {items.map((t, i) => (
            <Reveal as="li" key={i} className="relative grid gap-2 pb-12 pl-8 last:pb-0 md:grid-cols-[9.5rem_1fr] md:gap-10 md:pl-0">
              <span aria-hidden className="absolute left-0 top-2 size-2.5 -translate-x-1/2 rounded-full border-2 border-bg bg-brand-2 ring-1 ring-line-strong md:left-[9.5rem]" />
              <p className="font-display text-2xl font-semibold tracking-tight text-text md:pr-10 md:text-right">{t.year}</p>
              <div className="md:pl-10">
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 max-w-xl text-text-muted">{t.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Team({ content: c, data, index }: SectionProps<"TEAM", TeamMember[]>) {
  const members = list(data);
  if (!members.length) return null;
  return (
    <section className="section border-y border-line bg-bg-elevated">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index} />
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m, i) => (
            <Reveal as="li" key={m.id} delay={i * 0.06} className="group">
              <div className="overflow-hidden rounded-2xl border border-line">
                <Img src={m.photo} alt={`Portrait of ${m.name}`} width={600} height={720} className="aspect-[5/6] w-full transition duration-700 ease-out-expo group-hover:scale-[1.03]" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{m.name}</h3>
                  <p className="text-sm text-brand-text">{m.role}</p>
                </div>
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                    className="grid size-9 place-items-center rounded-full border border-line text-text-muted transition hover:border-line-strong hover:text-text">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                )}
              </div>
              {m.bio && <p className="mt-3 text-sm leading-relaxed text-text-muted">{m.bio}</p>}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const initials = (name: string) => name.replace(/[^A-Za-z0-9 .+#]/g, "").split(/[\s.]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function TechStack({ content: c, index }: SectionProps<"TECH_STACK">) {
  const groups = list(c.groups);
  if (!groups.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index} />
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g, gi) => (
            <Reveal key={gi} delay={gi * 0.05} className="rounded-2xl border border-line bg-surface/40 p-6 md:p-7">
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">{g.name}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {list(g.items).map((t) => (
                  <li key={t} className="inline-flex items-center gap-2.5 rounded-full border border-line bg-bg/60 py-1.5 pl-1.5 pr-3.5 text-sm transition hover:border-line-strong">
                    <span aria-hidden className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-brand/25 to-brand-2/25 font-mono text-[10px] font-semibold text-brand-text">{initials(t)}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
