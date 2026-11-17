import { useParams } from "react-router";
import { Briefcase, Clock, MapPin, Wallet } from "lucide-react";
import { useJob, useSettings } from "@/hooks/usePublic";
import { ApiError } from "@/lib/api";
import { Seo, absolute, breadcrumbLd } from "@/components/Seo";
import { NotFoundView } from "@/components/NotFoundView";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ActionLink } from "@/components/ui/action-link";
import { ErrorState, Shimmer } from "@/components/ui/states";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { stripHtml } from "@/lib/text";
import { JOB_TYPE_LABEL } from "./Careers";

const LD_TYPE = { FULL_TIME: "FULL_TIME", PART_TIME: "PART_TIME", CONTRACT: "CONTRACTOR", INTERN: "INTERN" } as const;

export default function JobDetail() {
  const { slug = "" } = useParams();
  const { data: job, isLoading, isError, error, refetch } = useJob(slug);
  const { data: s } = useSettings();

  if (isLoading) return <div className="container-x py-24"><Shimmer className="h-12 w-2/3" /><Shimmer className="mt-8 h-64 w-full" /></div>;
  if (isError && error instanceof ApiError && error.status === 404) return <NotFoundView title="We couldn't find that role" backHref="/careers" backLabel="See open positions" />;
  if (isError || !job) return <div className="container-x py-24"><ErrorState onRetry={() => refetch()} /></div>;

  const crumbs = [{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }, { name: job.title, path: `/careers/${job.slug}` }];

  if (job.status === "CLOSED") {
    return (
      <>
        <Seo title={job.title} noindex />
        <section className="container-x flex min-h-[60svh] flex-col items-start justify-center py-24">
          <Breadcrumbs items={crumbs} />
          <p className="mt-10 inline-flex rounded-full border border-line px-3 py-1 text-xs text-text-muted">Position closed</p>
          <h1 className="mt-5 max-w-3xl text-h1 font-semibold">{s?.pages.closedJobTitle || "This position has been filled"}</h1>
          <p className="lead mt-5 max-w-xl">{s?.pages.closedJobText}</p>
          <p className="mt-3 text-sm text-text-muted">Role: {job.title}</p>
          <ActionLink href="/careers" className="mt-10" arrow>See open positions</ActionLink>
        </section>
      </>
    );
  }

  const ld = {
    "@context": "https://schema.org", "@type": "JobPosting", title: job.title, description: job.description, datePosted: job.createdAt,
    employmentType: LD_TYPE[job.type], hiringOrganization: { "@type": "Organization", name: s?.general.siteName, sameAs: absolute("/"), logo: absolute("/favicon.svg") },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "IN" } },
    jobLocationType: /remote/i.test(job.location) ? "TELECOMMUTE" : undefined, directApply: true,
  };
  const facts = [
    { icon: MapPin, label: "Location", value: job.location }, { icon: Briefcase, label: "Type", value: JOB_TYPE_LABEL[job.type] },
    { icon: Clock, label: "Experience", value: job.experience }, ...(job.salary ? [{ icon: Wallet, label: "Compensation", value: job.salary }] : []),
  ];

  return (
    <>
      <Seo title={job.title} description={job.summary || stripHtml(job.description ?? "").slice(0, 160)} jsonLd={[ld, breadcrumbLd(crumbs)]} />
      <header className="border-b border-line pb-12 pt-14 md:pt-20">
        <div className="container-x">
          <Breadcrumbs items={crumbs} />
          <p className="mt-10 text-sm text-brand-text">{job.department}</p>
          <h1 className="mt-3 max-w-4xl text-h1 font-semibold">{job.title}</h1>
          <p className="lead mt-5 max-w-2xl">{job.summary}</p>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-bg p-5">
                <f.icon className="mt-0.5 size-4 text-brand-text" aria-hidden />
                <div className="flex flex-col-reverse"><dd className="text-sm font-medium">{f.value}</dd><dt className="text-xs text-text-muted">{f.label}</dt></div>
              </div>
            ))}
          </dl>
        </div>
      </header>
      <section className="section pt-14">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <h2 className="text-h3 font-semibold">About the role</h2>
            <div className="prose-nexivo mt-4" dangerouslySetInnerHTML={{ __html: job.description ?? "" }} />
            <h2 className="mt-12 text-h3 font-semibold">What we're looking for</h2>
            <div className="prose-nexivo mt-4" dangerouslySetInnerHTML={{ __html: job.requirements ?? "" }} />
          </div>
          <div id="apply" className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-3xl border border-line bg-surface/40 p-6 md:p-8 lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <h2 className="text-h3 font-semibold">Apply for this role</h2>
              {s?.pages.applyFormIntro && <p className="mt-2 text-sm text-text-muted">{s.pages.applyFormIntro}</p>}
              <div className="mt-8"><ApplyForm jobId={job.id} jobTitle={job.title} /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
