import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLenis } from "./SmoothScroll";

/** Thin brand-coloured progress bar driven by a CSS scroll timeline (no JS; hidden where unsupported). */
export function ScrollProgress() {
  return <div aria-hidden className="scroll-progress fixed inset-x-0 top-0 z-[60] h-0.5 bg-gradient-to-r from-brand to-brand-2" />;
}

export function BackToTop() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toTop = () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };
  return (
    <button type="button" onClick={toTop} aria-label="Back to top" tabIndex={visible ? 0 : -1}
      className={cn("glass fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full text-text transition-all duration-300 ease-out-expo hover:text-brand-text",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")}>
      <ArrowUp className="size-4" aria-hidden />
    </button>
  );
}
