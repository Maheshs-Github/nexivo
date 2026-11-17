import { Plus } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { ActionLink } from "@/components/ui/action-link";
import { Reveal } from "@/components/motion/Reveal";
import { PostCard } from "@/components/blog/PostCard";
import { useHideFooterCta } from "@/components/layout/chrome-context";
import { Eyebrow, SectionIntro, list, validCta, type SectionProps } from "./shared";

export function LatestPosts({ content: c, data, index }: SectionProps<"BLOGS", BlogPost[]>) {
  const posts = list(data);
  if (!posts.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index}
          action={validCta(c.cta) ? <ActionLink href={c.cta.href} variant="secondary" arrow>{c.cta.label}</ActionLink> : undefined} />
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => <Reveal key={p.id} delay={i * 0.06}><PostCard post={p} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner({ content: c }: SectionProps<"CTA">) {
  useHideFooterCta(true);
  if (!c.heading) return null;
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="border-gradient noise relative isolate overflow-hidden rounded-[2rem] bg-surface/50 px-6 py-14 md:px-14 md:py-20">
          <div aria-hidden className="absolute -right-24 -top-32 -z-10 size-[28rem] rounded-full opacity-40 blur-[100px]" style={{ background: "radial-gradient(closest-side, var(--brand), transparent)" }} />
          <div aria-hidden className="absolute -bottom-40 left-1/3 -z-10 size-[24rem] rounded-full opacity-25 blur-[100px]" style={{ background: "radial-gradient(closest-side, var(--brand-2), transparent)" }} />
          <div aria-hidden className="hairline-grid absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_left,#000,transparent_70%)]" />
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
              <h2 className="mt-4 max-w-3xl text-h1 font-semibold">{c.heading}</h2>
              {c.subheading && <p className="lead mt-5 max-w-2xl">{c.subheading}</p>}
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {validCta(c.primaryCta) && <ActionLink href={c.primaryCta.href} size="lg" arrow>{c.primaryCta.label}</ActionLink>}
              {validCta(c.secondaryCta) && <ActionLink href={c.secondaryCta.href} size="lg" variant="secondary">{c.secondaryCta.label}</ActionLink>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** FAQ: native <details> accordion (keyboard and screen-reader friendly by default). */
export function Faq({ content: c, index }: SectionProps<"FAQ">) {
  const items = list(c.items);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Eyebrow index={index}>{c.eyebrow}</Eyebrow>
          {c.heading && <h2 className="mt-4 text-h2 font-semibold">{c.heading}</h2>}
          {c.subheading && <p className="lead mt-5">{c.subheading}</p>}
        </div>
        <div className="border-t border-line lg:col-span-7 lg:col-start-6">
          {items.map((f, i) => (
            <details key={i} className="group border-b border-line" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left font-display text-lg font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                {f.question}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong transition duration-300 group-open:rotate-45 group-open:border-brand group-open:text-brand-text">
                  <Plus className="size-4" aria-hidden />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-12 text-text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RichText({ content: c, index }: SectionProps<"RICHTEXT">) {
  if (!c.html) return null;
  return (
    <section className="section">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow index={index}>{c.eyebrow}</Eyebrow>
          {c.heading && <h2 className="mt-4 text-h2 font-semibold">{c.heading}</h2>}
        </div>
        {/* HTML is sanitized on the server (sanitize-html) before it is saved. */}
        <div className="prose-nexivo lg:col-span-7 lg:col-start-6" dangerouslySetInnerHTML={{ __html: c.html }} />
      </div>
    </section>
  );
}
