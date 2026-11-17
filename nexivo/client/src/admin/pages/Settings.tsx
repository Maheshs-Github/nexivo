import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import type { SettingsGroup } from "@shared/settings";
import { api } from "@/lib/api";
import type { Settings as SettingsData } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { PageHeader, Panel } from "../components/kit";
import { SettingsGroupForm } from "../components/SettingsGroupForm";
import { NavEditor } from "../components/NavEditor";
import { isAdmin, useAuth } from "../lib/auth";

const TABS: { value: SettingsGroup | "navigation"; label: string; description: string }[] = [
  { value: "general", label: "General", description: "Name, tagline, logo and the hero announcement." },
  { value: "contact", label: "Contact", description: "Shown in the footer, contact page and structured data." },
  { value: "social", label: "Social", description: "Profile links in the footer." },
  { value: "footer", label: "Footer", description: "Footer copy and the call to action (also used for the navbar button)." },
  { value: "navigation", label: "Navigation", description: "Header and footer menus. Drag to reorder." },
  { value: "theme", label: "Theme", description: "Brand colour with a live preview." },
  { value: "seo", label: "SEO defaults", description: "Fallbacks when a page has no SEO of its own." },
  { value: "pages", label: "Page copy", description: "Success messages, 404 and closed-job text." },
];
const EDITOR_ALLOWED = new Set(["navigation", "pages"]);

export default function Settings() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get("tab")) ? params.get("tab")! : "general";
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => api.get<SettingsData>("/admin/settings") });

  return (
    <>
      <PageHeader title="Site settings" description="Global content and appearance. Changes go live as soon as you save." />
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })} className="gap-5">
        <TabsList className="h-auto flex-wrap">{TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}</TabsList>
        {isLoading ? <Skeleton className="h-96" /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : TABS.map((t) => {
          const readOnly = !admin && !EDITOR_ALLOWED.has(t.value);
          return (
            <TabsContent key={t.value} value={t.value} className="max-w-3xl">
              <Panel title={t.label} description={t.description} actions={readOnly ? <span className="inline-flex items-center gap-1 text-xs text-text-muted"><Lock className="size-3" />Admins only</span> : undefined}>
                {t.value === "navigation" ? <NavEditor /> : <SettingsGroupForm group={t.value} value={data[t.value] as Record<string, unknown>} readOnly={readOnly} />}
              </Panel>
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
}
