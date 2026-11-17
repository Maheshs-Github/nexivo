import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Briefcase, Eye, FileText, Inbox, PenLine, Plus, UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useAuth } from "../lib/auth";
import { timeAgo } from "../lib/resource";
import { PageHeader, Panel, StatusBadge } from "../components/kit";

interface Stats {
  counts: Record<"posts" | "published" | "drafts" | "services" | "projects" | "jobsOpen" | "applications" | "newApplications" | "messages" | "unread" | "views", number>;
  latestPosts: { id: number; title: string; status: string; updatedAt: string; views: number }[];
  latestApplications: { id: number; name: string; status: string; createdAt: string; job: { title: string } }[];
  latestMessages: { id: number; name: string; subject: string; isRead: boolean; createdAt: string }[];
  topPosts: { id: number; title: string; slug: string; views: number }[];
  activity: { date: string; applications: number; messages: number }[];
}

function Stat({ label, value, sub, icon: I, to }: { label: string; value: number; sub?: string; icon: typeof Eye; to: string }) {
  return (
    <Link to={to} className="group rounded-xl border border-line bg-surface/40 p-4 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between text-xs text-text-muted"><span>{label}</span><I className="size-4" aria-hidden /></div>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums tracking-tight">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </Link>
  );
}

const fmtDay = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => api.get<Stats>("/admin/dashboard/stats") });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${greeting}, ${user?.name.split(" ")[0] ?? ""}`} description="Here's what's happening across your site."
        actions={<><Button variant="outline" asChild><Link to="/admin/pages"><PenLine />Edit home page</Link></Button><Button asChild><Link to="/admin/blogs/new"><Plus />New post</Link></Button></>} />

      {isError ? <ErrorState onRetry={() => refetch()} /> : isLoading || !data ? (
        <div className="space-y-4"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-72" /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Blog views" value={data.counts.views} sub={`${data.counts.published} published · ${data.counts.drafts} drafts`} icon={Eye} to="/admin/blogs" />
            <Stat label="Unread messages" value={data.counts.unread} sub={`${data.counts.messages} total`} icon={Inbox} to="/admin/messages?filter=unread" />
            <Stat label="New applications" value={data.counts.newApplications} sub={`${data.counts.applications} total`} icon={UserRound} to="/admin/applications?status=NEW" />
            <Stat label="Open jobs" value={data.counts.jobsOpen} sub={`${data.counts.services} services · ${data.counts.projects} case studies`} icon={Briefcase} to="/admin/jobs" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Activity" description="Applications and messages per day, last 30 days" className="lg:col-span-2">
              <div className="h-64" role="img" aria-label="Line chart of applications and messages over the last 30 days">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.activity} margin={{ left: -24, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--brand)" stopOpacity={0.35} /><stop offset="1" stopColor="var(--brand)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--brand-2)" stopOpacity={0.3} /><stop offset="1" stopColor="var(--brand-2)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(d) => fmtDay(String(d))} contentStyle={{ background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="applications" name="Applications" stroke="var(--brand)" fill="url(#ga)" strokeWidth={2} />
                    <Area type="monotone" dataKey="messages" name="Messages" stroke="var(--brand-2)" fill="url(#gm)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Top posts" description="By total views">
              <ol className="space-y-3">
                {data.topPosts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="w-4 font-mono text-xs text-text-muted">{i + 1}</span>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="line-clamp-1 flex-1 hover:text-brand-text">{p.title}</a>
                    <span className="tabular-nums text-xs text-text-muted">{p.views.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Recent posts" actions={<Link to="/admin/blogs" className="text-xs text-text-muted hover:text-text">All posts</Link>}>
              <ul className="space-y-3">{data.latestPosts.map((p) => (
                <li key={p.id}><Link to={`/admin/blogs/${p.id}`} className="flex items-center gap-3 hover:text-brand-text"><FileText className="size-4 shrink-0 text-text-muted" /><span className="line-clamp-1 flex-1">{p.title}</span><StatusBadge status={p.status} /></Link></li>
              ))}</ul>
            </Panel>
            <Panel title="New applications" actions={<Link to="/admin/applications" className="text-xs text-text-muted hover:text-text">All applications</Link>}>
              <ul className="space-y-3">{data.latestApplications.map((a) => (
                <li key={a.id} className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate font-medium">{a.name}</p><p className="truncate text-xs text-text-muted">{a.job.title} · {timeAgo(a.createdAt)}</p></div><StatusBadge status={a.status} /></li>
              ))}</ul>
            </Panel>
            <Panel title="Latest messages" actions={<Link to="/admin/messages" className="text-xs text-text-muted hover:text-text">Inbox</Link>}>
              <ul className="space-y-3">{data.latestMessages.map((m) => (
                <li key={m.id}><Link to="/admin/messages" className="flex items-center gap-3 hover:text-brand-text">
                  {!m.isRead && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                  <div className="min-w-0 flex-1"><p className="truncate font-medium">{m.subject}</p><p className="truncate text-xs text-text-muted">{m.name} · {timeAgo(m.createdAt)}</p></div>
                  <ArrowUpRight className="size-3.5 text-text-muted" />
                </Link></li>
              ))}</ul>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
