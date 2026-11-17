import { lazy, Suspense, type ComponentType } from "react";
import { useSections } from "@/hooks/usePublic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState, Shimmer } from "@/components/ui/states";
import type { PageKey, Section, SectionType } from "@/lib/types";
import { PageHeader } from "./PageHeader";

// PageHeader (inner-page LCP) is bundled; the Hero chunk is prefetched at startup on "/" (lib/prefetch.ts); everything else loads on demand, so an inner page
// only downloads the sections it actually shows.
const pick = <K extends string>(loader: () => Promise<Record<K, AnySection>>, name: K) => lazy(() => loader().then((m) => ({ default: m[name] })));
const clientsStats = () => import("./ClientsStats");
const processWork = () => import("./ProcessWork");
const closing = () => import("./Closing");
const about = () => import("./AboutSections");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySection = ComponentType<{ content: any; data?: any; index: number }>;

/** Section type → component. Unknown types are skipped, so new types never break old clients. */
const REGISTRY: Partial<Record<SectionType, AnySection>> = {
  HERO: pick(() => import("./Hero"), "Hero"), PAGE_HEADER: PageHeader,
  CLIENTS: pick(clientsStats, "Clients"), STATS: pick(clientsStats, "Stats"),
  SERVICES: pick(() => import("./ServicesBento"), "ServicesBento"),
  PROCESS: pick(processWork, "Process"), CASE_STUDIES: pick(processWork, "CaseStudies"),
  TESTIMONIALS: pick(() => import("./Testimonials"), "Testimonials"),
  BLOGS: pick(closing, "LatestPosts"), CTA: pick(closing, "CtaBanner"), FAQ: pick(closing, "Faq"), RICHTEXT: pick(closing, "RichText"),
  STORY: pick(about, "Story"), MISSION_VISION: pick(about, "MissionVision"), VALUES: pick(about, "Values"),
  TIMELINE: pick(about, "Timeline"), TEAM: pick(about, "Team"), TECH_STACK: pick(about, "TechStack"),
};

/** Sections that get a running "01, 02..." index in their eyebrow. */
const NUMBERED = new Set<SectionType>(["SERVICES", "PROCESS", "CASE_STUDIES", "TESTIMONIALS", "BLOGS", "FAQ", "STORY", "MISSION_VISION", "VALUES", "TIMELINE", "TEAM", "TECH_STACK", "STATS", "RICHTEXT"]);

function SectionsSkeleton({ withHero }: { withHero: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading content" className="container-x py-24">
      {withHero ? <><Shimmer className="h-5 w-48" /><Shimmer className="mt-6 h-16 w-full max-w-3xl" /><Shimmer className="mt-3 h-16 w-2/3 max-w-2xl" /><Shimmer className="mt-8 h-6 w-full max-w-xl" /></>
        : <><Shimmer className="h-4 w-32" /><Shimmer className="mt-5 h-12 w-full max-w-2xl" /><Shimmer className="mt-5 h-6 w-full max-w-xl" /></>}
      <div className="mt-20 grid gap-4 md:grid-cols-3"><Shimmer className="h-56" /><Shimmer className="h-56" /><Shimmer className="h-56" /></div>
    </div>
  );
}

interface Props {
  page: PageKey;
  /** Only render these types (e.g. a page header above custom content). */
  only?: SectionType[];
  exclude?: SectionType[];
}

export function PageSections({ page, only, exclude }: Props) {
  const { data, isLoading, isError, refetch } = useSections(page);
  if (isLoading) return <SectionsSkeleton withHero={page === "HOME" && !only} />;
  if (isError) return <div className="container-x py-24"><ErrorState onRetry={() => refetch()} /></div>;

  const sections = (data ?? []).filter((s: Section) => (!only || only.includes(s.type)) && !exclude?.includes(s.type));
  let n = 0;
  return (
    <>
      {sections.map((s) => {
        const Cmp = REGISTRY[s.type];
        if (!Cmp) return null;
        const hasEyebrow = typeof (s.content as { eyebrow?: unknown } | null)?.eyebrow === "string" && !!(s.content as { eyebrow: string }).eyebrow;
        const index = NUMBERED.has(s.type) && hasEyebrow ? ++n : 0;
        return (
          <ErrorBoundary key={s.id} fallback={() => null}>
            <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
              <Cmp content={s.content ?? {}} data={s.data} index={index} />
            </Suspense>
          </ErrorBoundary>
        );
      })}
    </>
  );
}
