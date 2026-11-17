import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { Img } from "@/components/ui/img";
import { ActionLink } from "@/components/ui/action-link";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { Eyebrow, SectionIntro, list, validCta, type SectionProps } from "./shared";

/** Process: sticky intro on the left, a vertical rail of steps on the right. */
export function Process({ content: c, index }: SectionProps<"PROCESS">) {
  const steps = list(c.steps);
  if (!steps.length) return null;
  return (
    <section className="section border-y border-line bg-bg-elevated">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
            <Eyebrow index={index}>{c.eyebrow}</Eyebrow>
            {c.heading && <h2 className="mt-4 text-h2 font-semibold">{c.heading}</h2>}
            {c.subheading && <p className="lead mt-5 max-w-md">{c.subheading}</p>}
          </div>
        </div>
        <ol className="relative lg:col-span-6 lg:col-start-7">
          <span aria-hidden className="absolute bottom-6 left-[1.1875rem] top-6 w-px bg-gradient-to-b from-brand via-line-strong to-transparent" />
          {steps.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 0.05} className="relative grid grid-cols-[2.5rem_1fr] gap-5 pb-12 last:pb-0">
              <span className="relative z-10 grid size-10 place-items-center rounded-full border border-line-strong bg-bg font-mono text-xs text-brand-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-h3 font-semibold">{s.title}</h3>
                  {s.duration && <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{s.duration}</span>}
                </div>
                <p className="mt-2.5 max-w-lg text-text-muted">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Metrics({ items, className }: { items: Project["metrics"]; className?: string }) {
  const m = list(items);
  if (!m.length) return null;
  return (
    <dl className={cn("grid grid-cols-3 gap-4 border-t border-line pt-5", className)}>
      {m.slice(0, 3).map((x, i) => (
        <div key={i} className="flex flex-col-reverse gap-1"><dt className="text-xs leading-snug text-text-muted">{x.label}</dt><dd className="font-display text-xl font-semibold tracking-tight md:text-2xl">{x.value}</dd></div>
      ))}
    </dl>
  );
}

/** Case studies: one wide feature (image + metrics), then the rest as a two-up row. */
export function CaseStudies({ content: c, data, index }: SectionProps<"CASE_STUDIES", Project[]>) {
  const projects = list(data);
  if (!projects.length) return null;
  const [lead, ...rest] = projects;
  return (
    <section className="section">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index}
          action={validCta(c.cta) ? <ActionLink href={c.cta.href} variant="secondary" arrow>{c.cta.label}</ActionLink> : undefined} />
        <Reveal>
          <Link to={`/work/${lead.slug}`} className="border-gradient group grid overflow-hidden rounded-3xl bg-surface/40 lg:grid-cols-12">
            <div className="relative overflow-hidden lg:col-span-7">
              <Img src={lead.cover} alt={lead.title} width={1600} height={900} className="aspect-[16/10] size-full transition duration-700 ease-out-expo group-hover:scale-[1.03] lg:aspect-auto lg:h-full" />
            </div>
            <div className="flex flex-col p-7 md:p-10 lg:col-span-5">
              <p className="eyebrow">{[lead.client, lead.industry].filter(Boolean).join(" · ")}</p>
              <h3 className="mt-4 text-h3-lg font-semibold leading-tight tracking-tight">{lead.title}</h3>
              <p className="mt-4 text-text-muted">{lead.summary}</p>
              <Metrics items={lead.metrics} className="mt-auto pt-8" />
            </div>
          </Link>
        </Reveal>
        {rest.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <Link to={`/work/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/40 transition-colors hover:border-line-strong">
                  <div className="overflow-hidden"><Img src={p.cover} alt={p.title} width={1600} height={900} className="aspect-[16/9] w-full transition duration-700 ease-out-expo group-hover:scale-[1.03]" /></div>
                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">{[p.client, p.industry].filter(Boolean).join(" · ")}</p>
                        <h3 className="mt-3 text-h3 font-semibold">{p.title}</h3>
                      </div>
                      <ArrowUpRight aria-hidden className="mt-1 size-5 shrink-0 text-text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text" />
                    </div>
                    <Metrics items={p.metrics} className="mt-auto pt-6" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
