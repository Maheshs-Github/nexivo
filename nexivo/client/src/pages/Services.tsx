import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { useServices } from "@/hooks/usePublic";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { PageSections } from "@/components/sections/PageSections";
import { Icon } from "@/components/ui/icon";
import { Img } from "@/components/ui/img";
import { EmptyState, ErrorState, Shimmer } from "@/components/ui/states";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/** Full service list: alternating editorial rows instead of a uniform card grid. */
function ServiceRows() {
  const { data, isLoading, isError, refetch } = useServices();
  if (isLoading) return <div className="space-y-6">{[0, 1, 2].map((i) => <Shimmer key={i} className="h-72" />)}</div>;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState title="Services are being updated" text="Please check back shortly." />;
  return (
    <ol className="divide-y divide-line border-y border-line">
      {data.map((s, i) => (
        <Reveal as="li" key={s.id}>
          <Link to={`/services/${s.slug}`} className="group grid gap-8 py-12 md:grid-cols-12 md:gap-10 md:py-16">
            <div className={cn("md:col-span-5", i % 2 && "md:order-2 md:col-start-8")}>
              <div className="overflow-hidden rounded-2xl border border-line">
                <Img src={s.image} alt="" width={1600} height={900} className="aspect-[16/10] w-full transition duration-700 ease-out-expo group-hover:scale-[1.03]" />
              </div>
            </div>
            <div className={cn("flex flex-col md:col-span-6", i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7")}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-brand-text">{String(i + 1).padStart(2, "0")}</span>
                <span className="grid size-9 place-items-center rounded-lg border border-line text-brand-text"><Icon name={s.icon} className="size-4" /></span>
              </div>
              <h2 className="mt-5 text-h2 font-semibold transition-colors group-hover:text-brand-text">{s.title}</h2>
              <p className="lead mt-4">{s.shortDesc}</p>
              {s.features && s.features.length > 0 && (
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {s.features.slice(0, 6).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-muted"><Check className="mt-0.5 size-4 shrink-0 text-brand-2" aria-hidden />{f}</li>
                  ))}
                </ul>
              )}
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-text">
                Explore {s.title}<ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </ol>
  );
}

export default function Services() {
  return (
    <>
      <Seo page="SERVICES" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])]} />
      <PageSections page="SERVICES" only={["PAGE_HEADER"]} />
      <section className="section pt-12 md:pt-16"><div className="container-x"><ServiceRows /></div></section>
      <PageSections page="SERVICES" exclude={["PAGE_HEADER", "SERVICES"]} />
    </>
  );
}
