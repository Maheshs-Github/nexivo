import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Briefcase, ChevronsUpDown, ExternalLink, FileText, FolderKanban, Gauge, Images, Inbox, LayoutTemplate, LogOut, Menu, MessageSquareQuote,
  Search, Settings as SettingsIcon, Shapes, Tags, UserCog, UserRound, Users as UsersIcon, Building2, Layers,
} from "lucide-react";
import { useSettings } from "@/hooks/usePublic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeToggle } from "@/components/layout/Brand";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { isAdmin, useAuth } from "../lib/auth";
import { useBadges } from "../lib/resource";

type Item = { to: string; label: string; icon: typeof Gauge; badge?: "unread" | "new"; adminOnly?: boolean; end?: boolean };
const GROUPS: { label: string; items: Item[] }[] = [
  { label: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: Gauge, end: true }] },
  { label: "Content", items: [{ to: "/admin/blogs", label: "Blog posts", icon: FileText }, { to: "/admin/categories", label: "Categories", icon: Shapes }, { to: "/admin/tags", label: "Tags", icon: Tags }] },
  { label: "Website", items: [
    { to: "/admin/pages", label: "Pages & sections", icon: LayoutTemplate }, { to: "/admin/services", label: "Services", icon: Layers },
    { to: "/admin/projects", label: "Case studies", icon: FolderKanban }, { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { to: "/admin/team", label: "Team", icon: UsersIcon }, { to: "/admin/clients", label: "Client logos", icon: Building2 },
    { to: "/admin/media", label: "Media library", icon: Images }, { to: "/admin/seo", label: "SEO", icon: Search },
  ] },
  { label: "Careers", items: [{ to: "/admin/jobs", label: "Jobs", icon: Briefcase }, { to: "/admin/applications", label: "Applications", icon: UserRound, badge: "new" }] },
  { label: "Inbox", items: [{ to: "/admin/messages", label: "Messages", icon: Inbox, badge: "unread" }] },
  { label: "Settings", items: [{ to: "/admin/settings", label: "Site settings", icon: SettingsIcon }, { to: "/admin/users", label: "Users", icon: UserCog, adminOnly: true }] },
];

const LABELS: Record<string, string> = Object.fromEntries(GROUPS.flatMap((g) => g.items.map((i) => [i.to.replace("/admin/", "").replace("/admin", ""), i.label])));

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const { data: badges } = useBadges();
  return (
    <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {GROUPS.map((g) => {
        const items = g.items.filter((i) => !i.adminOnly || isAdmin(user));
        if (!items.length) return null;
        return (
          <div key={g.label}>
            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted/80">{g.label}</p>
            <ul className="space-y-0.5">
              {items.map((i) => {
                const count = i.badge === "unread" ? badges?.unread : i.badge === "new" ? badges?.newApplications : 0;
                return (
                  <li key={i.to}>
                    <NavLink to={i.to} end={i.end} onClick={onNavigate}
                      className={({ isActive }) => cn("flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors",
                        isActive ? "bg-surface-2 font-medium text-text" : "text-text-muted hover:bg-surface-2/60 hover:text-text")}>
                      <i.icon className="size-4 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{i.label}</span>
                      {!!count && <span className="rounded-full bg-brand-strong px-1.5 text-[10px] font-semibold leading-4 text-white" aria-label={`${count} ${i.badge}`}>{count}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  const { data: s } = useSettings();
  return (
    <Link to="/admin" className="flex h-14 items-center gap-2.5 border-b border-line px-4">
      <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-white">
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor"><path d="M5 19V5h3l8 9V5h3v14h-3L8 10v9z" /></svg>
      </span>
      <span className="min-w-0"><span className="block truncate text-sm font-semibold">{s?.general.siteName ?? "Admin"}</span><span className="block text-[11px] text-text-muted">Content studio</span></span>
    </Link>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-surface-2" aria-label="Account menu">
          <span className="grid size-7 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold">{initials}</span>
          <span className="hidden text-xs sm:block"><span className="block font-medium">{user.name}</span><span className="block text-text-muted">{user.role === "ADMIN" ? "Admin" : "Editor"}</span></span>
          <ChevronsUpDown className="hidden size-3.5 text-text-muted sm:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-text-muted">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/admin/profile")}><UserRound />Profile & password</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.open("/", "_blank", "noopener")}><ExternalLink />View site</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={async () => { await logout(); navigate("/admin/login"); }}><LogOut />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { setAccent } = useTheme();
  const { data: s } = useSettings();
  useEffect(() => { if (s?.theme.accent) setAccent(s.theme.accent); }, [s?.theme.accent, setAccent]);

  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const crumb = parts.length ? LABELS[parts[0]] ?? parts[0] : "Dashboard";
  const sub = parts[1] ? (parts[1] === "new" ? "New" : "Edit") : null;

  return (
    <div className="min-h-dvh bg-bg text-sm">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-62 flex-col border-r border-line bg-bg-elevated lg:flex">
        <SidebarBrand /><SidebarNav />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-bg-elevated p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col"><SidebarBrand /><SidebarNav onNavigate={() => setOpen(false)} /></div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-62">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl md:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></Button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <Link to="/admin" className="text-text-muted hover:text-text">Admin</Link>
            <span className="text-text-muted/60">/</span>
            <span className={cn("truncate", sub ? "text-text-muted" : "font-medium")}>{crumb}</span>
            {sub && <><span className="text-text-muted/60">/</span><span className="font-medium">{sub}</span></>}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><a href="/" target="_blank" rel="noopener"><ExternalLink />View site</a></Button>
            <ThemeToggle className="size-8" />
            <UserMenu />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-8">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
