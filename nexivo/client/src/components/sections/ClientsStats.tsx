import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import type { ClientLogo } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow, SectionIntro, list, type SectionProps } from "./shared";

/** CSS-only logo marquee. Duplicated track for a seamless loop; pauses on hover; static under reduced motion. */
export function Clients({ content: c, data }: SectionProps<"CLIENTS", ClientLogo[]>) {
  const logos = list(data);
  if (!logos.length) return null;
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-14 pr-14 md:gap-20 md:pr-20">
      {logos.map((l) => (
        <li key={l.id} className="shrink-0">
          <img src={l.logo} alt={hidden ? "" : l.name} width={180} height={40} loading="lazy" decoding="async"
            className="h-7 w-auto opacity-70 grayscale transition duration-300 hover:opacity-100 md:h-8" />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="border-y border-line bg-bg-elevated py-10 md:py-12">
      <div className="container-x flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
        {c.heading && <p className="shrink-0 text-sm text-text-muted md:max-w-[11rem]">{c.heading}</p>}
        <div className="mask-fade-x group relative flex min-w-0 flex-1 overflow-hidden" style={{ ["--marquee-duration" as string]: `${logos.length * 5}s` }}>
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {track(false)}
            {track(true)}
          </div>
        </div>
      </div>
    </section>
  );
}

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const decimals = Number.isInteger(value) ? 0 : String(value).split(".")[1]?.length ?? 1;
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) { if (reduced) setShown(value); return; }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setShown(value * (1 - Math.pow(1 - t, 4)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden>{prefix}{shown.toFixed(decimals)}{suffix}</span>
      <span className="sr-only">{prefix}{value}{suffix}</span>
    </span>
  );
}

export function Stats({ content: c, index }: SectionProps<"STATS">) {
  const items = list(c.items);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        {c.heading ? <SectionIntro eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} index={index} /> : c.eyebrow && <Eyebrow index={index} className="mb-10">{c.eyebrow}</Eyebrow>}
        <Reveal>
          <dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
            {items.map((s, i) => (
              <div key={i} className="flex flex-col-reverse gap-3 border-b border-line py-8 pr-6 [&:nth-child(odd)]:border-r lg:border-b-0 lg:[&:not(:last-child)]:border-r lg:pl-8 lg:first:pl-0 [&:nth-child(even)]:pl-6 lg:[&:nth-child(even)]:pl-8">
                <dt className="text-sm text-text-muted">{s.label}</dt>
                <dd className="font-display text-stat font-semibold leading-none tracking-tight">
                  <CountUp value={Number(s.value) || 0} prefix={s.prefix} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
