import { useSettings } from "@/hooks/usePublic";
import { ActionLink } from "@/components/ui/action-link";
import { Seo } from "@/components/Seo";

/** Branded "not found" block; used by the 404 route and by detail pages whose slug does not exist. */
export function NotFoundView({ title, text, backHref = "/", backLabel = "Back to home" }: { title?: string; text?: string; backHref?: string; backLabel?: string }) {
  const { data: s } = useSettings();
  const heading = title ?? s?.pages.notFoundTitle ?? "Page not found";
  return (
    <section className="relative isolate overflow-hidden">
      <Seo title={heading} noindex />
      <div aria-hidden className="hairline-grid mask-radial absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden className="absolute left-1/2 top-10 -z-10 size-[30rem] -translate-x-1/2 rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(closest-side, var(--brand), transparent)" }} />
      <div className="container-x flex min-h-[70svh] flex-col items-start justify-center py-24">
        <p aria-hidden className="text-gradient font-display text-mega font-semibold leading-none tracking-tighter">404</p>
        <h1 className="mt-6 max-w-2xl text-h1 font-semibold">{heading}</h1>
        <p className="lead mt-5 max-w-xl">{text ?? s?.pages.notFoundText}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ActionLink href={backHref} arrow>{backLabel}</ActionLink>
          <ActionLink href="/contact" variant="secondary">Contact us</ActionLink>
        </div>
      </div>
    </section>
  );
}
