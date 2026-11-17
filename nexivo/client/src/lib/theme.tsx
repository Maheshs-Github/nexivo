import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Mode = "dark" | "light";
interface ThemeCtx { mode: Mode; toggle: () => void; setMode: (m: Mode) => void; setAccent: (hex: string | null) => void }

const ThemeContext = createContext<ThemeCtx | null>(null);
const MODE_KEY = "nexivo-theme";
const ACCENT_KEY = "nexivo-accent";
const HEX = /^#[0-9a-fA-F]{6}$/;

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string | null) => {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* storage blocked */ }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => (read(MODE_KEY) === "light" ? "light" : "dark"));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", mode === "dark" ? "#0B1020" : "#F8FAFF");
  }, [mode]);

  const setMode = useCallback((m: Mode) => { setModeState(m); write(MODE_KEY, m); }, []);
  const toggle = useCallback(() => setMode(mode === "dark" ? "light" : "dark"), [mode, setMode]);

  /** Applies the brand accent from Settings (or a live preview from the admin). */
  const setAccent = useCallback((hex: string | null) => {
    const root = document.documentElement;
    if (hex && HEX.test(hex)) { root.style.setProperty("--brand", hex); write(ACCENT_KEY, hex); }
    else { root.style.removeProperty("--brand"); write(ACCENT_KEY, null); }
  }, []);

  const value = useMemo(() => ({ mode, toggle, setMode, setAccent }), [mode, toggle, setMode, setAccent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** True when the visitor asked for less motion. */
export function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
