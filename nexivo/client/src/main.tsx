import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { ApiError } from "@/lib/api";
import App from "./App";
import { prefetchForPath } from "./lib/prefetch";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Toasts are only needed after an interaction, so sonner stays out of the entry chunk.
const Toaster = lazy(() => import("sonner").then((m) => ({ default: m.Toaster })));

function ThemedToaster() {
  const { mode } = useTheme();
  return <Suspense fallback={null}><Toaster theme={mode} position="bottom-right" richColors closeButton toastOptions={{ className: "font-sans" }} /></Suspense>;
}

// Start API requests in parallel with the route chunk downloads.
prefetchForPath(queryClient, window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <ThemedToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
