import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { useNav, useSettings } from "@/hooks/usePublic";
import { ActionLink, SmartLink } from "@/components/ui/action-link";
import { cn } from "@/lib/utils";
import { Logo, ThemeToggle } from "./Brand";
import { useLenis } from "./SmoothScroll";

const MobileMenu = lazy(() => import("./MobileMenu"));

export function Navbar() {
  const { data: nav } = useNav();
  const { data: settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { if (open) lenis?.stop(); else lenis?.start(); }, [open, lenis]);

  const items = nav?.header ?? [];
  const cta = settings?.footer.ctaLabel && settings.footer.ctaUrl ? { label: settings.footer.ctaLabel, href: settings.footer.ctaUrl } : null;

  return (
    <header className={cn("sticky top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
      scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm">Skip to content</a>
      <nav aria-label="Main" className="container-x flex h-nav items-center justify-between gap-6">
        <Logo name={settings?.general.siteName} logo={settings?.general.logo} />

        <ul className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <li key={item.id}>
              {item.url.startsWith("/") ? (
                <NavLink to={item.url} end={item.url === "/"}
                  className={({ isActive }) => cn("relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive ? "text-text" : "text-text-muted hover:text-text")}>
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && <span aria-hidden className="absolute inset-x-3.5 -bottom-[1px] h-px bg-gradient-to-r from-brand to-brand-2" />}
                    </>
                  )}
                </NavLink>
              ) : (
                <SmartLink href={item.url} className="rounded-full px-3.5 py-2 text-sm font-medium text-text-muted hover:text-text">{item.label}</SmartLink>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {cta && <ActionLink href={cta.href} size="sm" className="hidden sm:inline-flex" arrow>{cta.label}</ActionLink>}
          <button type="button" onClick={() => { setMounted(true); setOpen(true); }} aria-haspopup="dialog" aria-expanded={open}
            className="grid size-10 place-items-center rounded-full text-text hover:bg-surface-2 md:hidden" aria-label="Open menu">
            <Menu className="size-5" aria-hidden />
          </button>
          {mounted && <Suspense fallback={null}><MobileMenu open={open} onOpenChange={setOpen} items={items} cta={cta} /></Suspense>}
        </div>
      </nav>
    </header>
  );
}
