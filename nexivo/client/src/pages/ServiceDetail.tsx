import { Link, useParams } from "react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { useService } from "@/hooks/usePublic";
import { ApiError } from "@/lib/api";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { NotFoundView } from "@/components/NotFoundView";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Img } from "@/components/ui/img";
import { ErrorState, Shimmer } from "@/components/ui/states";
import { ActionLink } from "@/components/ui/action-link";
import { PageSections } from "@/components/sections/PageSections";
import { Reveal } from "@/components/motion/Reveal";
import { stripHtml } from "@/lib/text";

export default function ServiceDetail() {
  const { slug = "" } = useParams();
  const { data: s, isLoading, isError, error, refetch } = useService(slug);

  if (isLoading) return <div className="container-x py-24"><Shimmer className="h-5 w-40" /><Shimmer className="mt-6 h-14 w-2/3" /><Shimmer className="mt-12 aspect-[16/7] w-full" /></div>;
  if (isError && error instanceof ApiError && error.status === 404) return <NotFoundView title="We couldn't find that service" backHref="/services" backLabel="All services" />;
  if (isError || !s) return <div className="container-x py-24"><ErrorState onRetry={() => refetch()} /></div>;

  const crumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.title, path: `/services/${s.slug}` }];
  return (
    <>
      <Seo title={s.title} description={s.shortDesc} image={s.image}
        jsonLd={[breadcrumbLd(crumbs), { "@context": "https://schema.org", "@type": "Service", name: s.title, description: stripHtml(s.shortDesc), serviceType: s.title }]} />
      <header className="relative isolate overflow-hidden border-b border-line pb-14 pt-14 md:pt-20">
        <div aria-hidden className="hairline-grid mask-fade-b absolute inset-0 -z-10 opacity-50" />
        <div className="container-x">
          <Breadcrumbs items={crumbs} />
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <span className="grid size-12 place-items-center rounded-xl border border-line bg-surface/60 text-brand-text"><Icon name={s.icon} className="size-5" /></span>
              <h1 className="mt-6 text-h1 font-semibold">{s.title}</h1>
              <p className="lead mt-5 max-w-2xl">{s.shortDesc}</p>
            </Reveal>
            <div className="flex lg:col-span-4 lg:col-start-9 lg:justify-end"><ActionLink href="/contact" size="lg" arrow>Discuss your project</ActionLink></div>
          </div>
        </div>
      </header>

      <section className="section pt-14">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            {s.image && <div className="mb-12 overflow-hidden rounded-3xl border border-line"><Img src={s.image} alt="" width={1600} height={900} priority className="aspect-[16/9] w-full" /></div>}
            {/* Sanitized server-side before saving. */}
            <div className="prose-nexivo" dangerouslySetInnerHTML={{ __html: s.description }} />
          </div>
          <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
            {s.features && s.features.length > 0 && (
              <div className="rounded-2xl border border-line bg-surface/40 p-6 lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">What's included</h2>
                <ul className="mt-5 space-y-3">
                  {s.features.map((f) => <li key={f} className="flex gap-3 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-brand-2" aria-hidden />{f}</li>)}
                </ul>
                <ActionLink href="/contact" className="mt-7 w-full" arrow>Get an estimate</ActionLink>
              </div>
            )}
          </aside>
        </div>
      </section>

      {s.others.length > 0 && (
        <section className="border-t border-line py-16">
          <div className="container-x">
            <h2 className="eyebrow">Other services</h2>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
              {s.others.map((o) => (
                <li key={o.id} className="bg-bg">
                  <Link to={`/services/${o.slug}`} className="group flex h-full flex-col gap-4 p-5 transition-colors hover:bg-surface/60">
                    <div className="flex items-center justify-between"><Icon name={o.icon} className="size-5 text-brand-text" /><ArrowUpRight className="size-4 text-text-muted transition group-hover:text-text" aria-hidden /></div>
                    <span className="font-medium">{o.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <PageSections page="SERVICES" only={["CTA"]} />
    </>
  );
}
