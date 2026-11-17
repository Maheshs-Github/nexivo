import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { slugifyHeading } from "@/lib/text";
import { cn } from "@/lib/utils";

export interface TocItem { id: string; text: string; level: 2 | 3 }

/** Adds stable ids to h2/h3 in the (already sanitized) article HTML and returns the table of contents. */
export function useArticle(html: string) {
  return useMemo(() => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const toc: TocItem[] = [];
    const used = new Set<string>();
    doc.querySelectorAll("h2, h3").forEach((h) => {
      let id = h.id || slugifyHeading(h.textContent ?? "");
      for (let n = 2; used.has(id); n++) id = `${slugifyHeading(h.textContent ?? "")}-${n}`;
      used.add(id);
      h.id = id;
      toc.push({ id, text: h.textContent ?? "", level: h.tagName === "H2" ? 2 : 3 });
    });
    return { html: doc.body.innerHTML, toc };
  }, [html]);
}

/** Highlights the heading currently being read. */
export function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    if (!ids.length) return;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-80px 0px -65% 0px", threshold: [0, 1] });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

export function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start 80px", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-nav z-40 h-0.5 origin-left bg-gradient-to-r from-brand to-brand-2" />;
}

export function TableOfContents({ toc, active }: { toc: TocItem[]; active: string }) {
  if (toc.length < 2) return null;
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">On this page</p>
      <ul className="mt-4 space-y-1 border-l border-line">
        {toc.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={active === t.id ? "location" : undefined}
              className={cn("-ml-px block border-l py-1.5 leading-snug transition-colors", t.level === 3 ? "pl-7" : "pl-4",
                active === t.id ? "border-brand text-text" : "border-transparent text-text-muted hover:text-text")}>
              {t.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ShareLinks({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: "X", href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };
  const pill = "inline-flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-sm text-text-muted transition hover:border-line-strong hover:text-text";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Share</span>
      <button type="button" onClick={copy} className={pill}>{copied ? <Check className="size-4 text-success" aria-hidden /> : <Link2 className="size-4" aria-hidden />}{copied ? "Copied" : "Copy link"}</button>
      {links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={pill} aria-label={`Share on ${l.label}`}>{l.label}</a>)}
    </div>
  );
}
