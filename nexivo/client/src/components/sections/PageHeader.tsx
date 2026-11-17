import { Eyebrow, type SectionProps } from "./primitives";

/** Inner-page title block. Rendered without animation: it is the LCP element of inner pages. */
export function PageHeader({ content: c }: SectionProps<"PAGE_HEADER">) {
  if (!c.heading) return null;
  return (
    <header className="relative isolate overflow-hidden border-b border-line pb-16 pt-20 md:pb-20 md:pt-28">
      <div aria-hidden className="hairline-grid mask-fade-b absolute inset-0 -z-10 opacity-50" />
      <div aria-hidden className="absolute -top-40 left-1/4 -z-10 h-80 w-[40rem] rounded-full opacity-25 blur-[120px]" style={{ background: "radial-gradient(closest-side, var(--brand), transparent)" }} />
      <div className="container-x">
        {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
        <h1 className="mt-5 max-w-4xl text-h1 font-semibold">{c.heading}</h1>
        {c.subheading && <p className="lead mt-6 max-w-2xl">{c.subheading}</p>}
      </div>
    </header>
  );
}
