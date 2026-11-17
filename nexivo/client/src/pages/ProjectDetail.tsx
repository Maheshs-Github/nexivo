import { useParams } from "react-router";
import { ExternalLink } from "lucide-react";
import { useProject } from "@/hooks/usePublic";
import { ApiError } from "@/lib/api";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { NotFoundView } from "@/components/NotFoundView";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Img } from "@/components/ui/img";
import { ErrorState, Shimmer } from "@/components/ui/states";
import { Reveal } from "@/components/motion/Reveal";
import { PageSections } from "@/components/sections/PageSections";

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { data: p, isLoading, isError, error, refetch } = useProject(slug);

  if (isLoading) return <div className="container-x py-24"><Shimmer className="h-14 w-2/3" /><Shimmer className="mt-12 aspect-[16/7] w-full" /></div>;
  if (isError && error instanceof ApiError && error.status === 404) return <NotFoundView title="We couldn't find that case study" />;
  if (isError || !p) return <div className="container-x py-24"><ErrorState onRetry={() => refetch()} /></div>;

  const crumbs = [{ name: "Home", path: "/" }, { name: "Work", path: "/" }, { name: p.title, path: `/work/${p.slug}` }];
  return (
    <>
      <Seo title={p.title} description={p.summary} image={p.cover} type="article" jsonLd={[breadcrumbLd(crumbs)]} />
      <header className="pb-12 pt-14 md:pt-20">
        <div className="container-x">
          <Breadcrumbs items={crumbs} />
          <Reveal className="mt-10 max-w-4xl">
            <p className="eyebrow">{[p.client, p.industry].filter(Boolean).join(" · ")}</p>
            <h1 className="mt-5 text-h1 font-semibold">{p.title}</h1>
            <p className="lead mt-6 max-w-2xl">{p.summary}</p>
          </Reveal>
        </div>
      </header>
      <div className="container-x">
        <div className="overflow-hidden rounded-3xl border border-line"><Img src={p.cover} alt={p.title} width={1600} height={900} priority className="aspect-[16/8] w-full" /></div>
        {p.metrics && p.metrics.length > 0 && (
          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {p.metrics.map((m, i) => (
              <div key={i} className="flex flex-col-reverse gap-2 bg-bg p-6 md:p-8">
                <dt className="text-sm text-text-muted">{m.label}</dt>
                <dd className="font-display text-stat font-semibold leading-none tracking-tight">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <section className="section pt-16">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            {p.techStack && p.techStack.length > 0 && (
              <>
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Stack</h2>
                <ul className="mt-4 flex flex-wrap gap-2">{p.techStack.map((t) => <li key={t} className="rounded-full border border-line px-3 py-1 text-sm">{t}</li>)}</ul>
              </>
            )}
            {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-text hover:underline">Visit live product<ExternalLink className="size-4" aria-hidden /></a>}
          </aside>
          <div className="prose-nexivo lg:col-span-7 lg:col-start-5" dangerouslySetInnerHTML={{ __html: p.content ?? "" }} />
        </div>
      </section>
      <PageSections page="HOME" only={["CTA"]} />
    </>
  );
}
