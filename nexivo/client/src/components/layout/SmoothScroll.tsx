import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/lib/theme";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Lenis smooth scrolling (off under prefers-reduced-motion) + scroll-to-top on navigation. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ lerp: 0.1, autoRaf: true, anchors: { offset: -80 } });
    setLenis(instance);
    return () => { instance.destroy(); setLenis(null); };
  }, [reduced]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (hash) return;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
