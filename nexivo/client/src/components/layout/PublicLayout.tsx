import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useSettings } from "@/hooks/usePublic";
import { useTheme } from "@/lib/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OrganizationLd } from "@/components/Seo";
import { PageLoader } from "@/components/ui/page-loader";
import { SmoothScroll } from "./SmoothScroll";
import { BackToTop, ScrollProgress } from "./ScrollChrome";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChromeProvider } from "./chrome-context";

/** Applies the brand accent from Settings → Theme as the --brand CSS variable. */
function useAccentFromSettings() {
  const { data } = useSettings();
  const { setAccent } = useTheme();
  useEffect(() => { if (data?.theme.accent) setAccent(data.theme.accent); }, [data?.theme.accent, setAccent]);
}

export default function PublicLayout() {
  useAccentFromSettings();
  const { pathname } = useLocation();

  return (
    <SmoothScroll>
      <ChromeProvider>
      <div className="flex min-h-dvh flex-col">
        <ScrollProgress />
        <Navbar />
        <main id="main" tabIndex={-1} className="min-h-svh flex-1 outline-none">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader />}>
              <div key={pathname} className="animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out [--tw-enter-opacity:0.4]">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <BackToTop />
        <OrganizationLd />
      </div>
      </ChromeProvider>
    </SmoothScroll>
  );
}
