import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Chrome { footerCta: boolean; setFooterCta: (v: boolean) => void }
const ChromeContext = createContext<Chrome>({ footerCta: true, setFooterCta: () => undefined });

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [footerCta, setFooterCta] = useState(true);
  return <ChromeContext.Provider value={{ footerCta, setFooterCta }}>{children}</ChromeContext.Provider>;
}

export const useChrome = () => useContext(ChromeContext);

/** Hides the footer CTA band while the calling page renders its own CTA. */
export function useHideFooterCta(hide: boolean) {
  const { setFooterCta } = useChrome();
  useEffect(() => {
    setFooterCta(!hide);
    return () => setFooterCta(true);
  }, [hide, setFooterCta]);
}
