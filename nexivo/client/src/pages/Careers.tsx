import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useJobs } from "@/hooks/usePublic";
import type { Job, JobType } from "@/lib/types";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { PageSections } from "@/components/sections/PageSections";
import { EmptyState, ErrorState, Shimmer } from "@/components/ui/states";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export const JOB_TYPE_LABEL: Record<JobType, string> = { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACT: "Contract", INTERN: "Internship" };

function Filter({ label, name, value, options, onChange }: { label: string; name: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-text-muted">
      {label}
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 min-w-44 rounded-full border border-line-strong bg-surface/60 px-4 text-sm text-text focus:border-brand focus:outline-none">
        <option value="">All</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function JobRow({ job }: { job: Job }) {
  return (
    <Link to={`/careers/${job.slug}`} className="group grid gap-3 py-7 transition-colors md:grid-cols-12 md:items-center md:gap-6">
      <div className="md:col-span-6">
        <p className="text-xs text-brand-text">{job.department}</p>
        <h3 className="mt-1.5 text-lg font-semibold transition-colors group-hover:text-brand-text md:text-xl">{job.title}</h3>
        <p className="mt-1.5 line-clamp-1 text-sm text-text-muted">{job.summary}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-text-muted md:col-span-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1"><MapPin className="size-3.5" aria-hidden />{job.location}</span>
        <span className="rounded-full border border-line px-3 py-1">{JOB_TYPE_LABEL[job.type]}</span>
        <span className="rounded-full border border-line px-3 py-1">{job.experience}</span>
      </div>
      <ArrowUpRight aria-hidden className="hidden size-5 justify-self-end text-text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text md:col-span-1 md:block" />
    </Link>
  );
}

export default function Careers() {
  const { data, isLoading, isError, refetch } = useJobs();
  const [params, setParams] = useSearchParams();
  const dept = params.get("department") ?? "";
  const type = params.get("type") ?? "";
  const location = params.get("location") ?? "";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const jobs = data ?? [];
  const options = useMemo(() => ({
    departments: [...new Set(jobs.map((j) => j.department))].sort(),
    locations: [...new Set(jobs.map((j) => j.location))].sort(),
    types: [...new Set(jobs.map((j) => j.type))],
  }), [jobs]);
  const filtered = jobs.filter((j) => (!dept || j.department === dept) && (!type || j.type === type) && (!location || j.location === location));

  return (
    <>
      <Seo page="CAREERS" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }])]} />
      <PageSections page="CAREERS" only={["PAGE_HEADER"]} />
      <section id="open-roles" className="section pt-12 md:pt-16">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-h2 font-semibold">Open positions</h2>
              <p className="mt-2 text-text-muted" aria-live="polite">{isLoading ? "Loading roles" : `${filtered.length} ${filtered.length === 1 ? "role" : "roles"}`}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Filter label="Department" name="department" value={dept} onChange={(v) => set("department", v)} options={options.departments.map((d) => ({ value: d, label: d }))} />
              <Filter label="Type" name="type" value={type} onChange={(v) => set("type", v)} options={options.types.map((t) => ({ value: t, label: JOB_TYPE_LABEL[t] }))} />
              <Filter label="Location" name="location" value={location} onChange={(v) => set("location", v)} options={options.locations.map((l) => ({ value: l, label: l }))} />
            </div>
          </div>
          <div className={cn("mt-10 border-t border-line")}>
            {isLoading ? (
              <div className="divide-y divide-line">{[0, 1, 2].map((i) => <div key={i} className="py-7"><Shimmer className="h-3 w-24" /><Shimmer className="mt-3 h-6 w-2/3" /></div>)}</div>
            ) : isError ? (
              <ErrorState className="mt-8" onRetry={() => refetch()} />
            ) : filtered.length === 0 ? (
              <EmptyState className="mt-8" title="No roles match these filters" text="Try another department or location, or check back soon." />
            ) : (
              <ul className="divide-y divide-line border-b border-line">
                {filtered.map((j, i) => <Reveal as="li" key={j.id} delay={Math.min(i, 6) * 0.04}><JobRow job={j} /></Reveal>)}
              </ul>
            )}
          </div>
        </div>
      </section>
      <PageSections page="CAREERS" exclude={["PAGE_HEADER"]} />
    </>
  );
}
