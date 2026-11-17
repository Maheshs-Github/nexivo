import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { settingsSchemas, type SettingsGroup } from "@shared/settings";
import { api, ApiError } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { FormFields, type WithLayout } from "./FormKit";

export const GROUP_FIELDS: Record<SettingsGroup, WithLayout[]> = {
  general: [
    { name: "siteName", label: "Site name", kind: "text", half: true }, { name: "tagline", label: "Tagline", kind: "text", half: true },
    { name: "description", label: "Short description", kind: "textarea" }, { name: "logo", label: "Logo (optional, replaces the wordmark)", kind: "image" },
    { name: "announcement", label: "Announcement pill (hero)", kind: "text", half: true }, { name: "announcementUrl", label: "Announcement link", kind: "text", half: true },
  ],
  contact: [
    { name: "email", label: "General email", kind: "email", half: true }, { name: "salesEmail", label: "Projects email", kind: "email", half: true },
    { name: "careersEmail", label: "Careers email", kind: "email", half: true }, { name: "phone", label: "Phone", kind: "text", half: true },
    { name: "whatsapp", label: "WhatsApp", kind: "text", half: true }, { name: "hours", label: "Office hours", kind: "text", half: true },
    { name: "address", label: "Street address", kind: "text", half: true }, { name: "city", label: "City / postcode", kind: "text", half: true },
    { name: "mapEmbedUrl", label: "Map embed URL", kind: "textarea", hint: "Google Maps → Share → Embed a map → copy the src URL. OpenStreetMap embed URLs work too." },
  ],
  social: [
    { name: "linkedin", label: "LinkedIn", kind: "url", half: true }, { name: "x", label: "X (Twitter)", kind: "url", half: true },
    { name: "github", label: "GitHub", kind: "url", half: true }, { name: "instagram", label: "Instagram", kind: "url", half: true },
    { name: "dribbble", label: "Dribbble", kind: "url", half: true }, { name: "youtube", label: "YouTube", kind: "url", half: true },
  ],
  footer: [
    { name: "about", label: "About text", kind: "textarea" }, { name: "copyright", label: "Copyright line", kind: "text" },
    { name: "ctaHeading", label: "Footer CTA heading", kind: "text", half: true }, { name: "ctaLabel", label: "CTA button label (also in the navbar)", kind: "text", half: true },
    { name: "ctaText", label: "Footer CTA text", kind: "textarea" }, { name: "ctaUrl", label: "CTA button link", kind: "text", half: true },
  ],
  theme: [
    { name: "accent", label: "Brand accent colour", kind: "color", hint: "Used for buttons, links, focus rings and gradients across the site." },
    { name: "defaultMode", label: "Default mode", kind: "select", options: [{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }] },
  ],
  seo: [
    { name: "defaultTitle", label: "Default title", kind: "text" }, { name: "titleTemplate", label: "Title template", kind: "text", hint: "%s is replaced by the page title", half: true },
    { name: "twitterHandle", label: "X handle", kind: "text", half: true }, { name: "defaultDescription", label: "Default description", kind: "textarea" },
    { name: "keywords", label: "Keywords", kind: "text" }, { name: "ogImage", label: "Default social image", kind: "image" },
  ],
  pages: [
    { name: "contactFormHeading", label: "Contact form heading", kind: "text", half: true }, { name: "contactFormText", label: "Contact form intro", kind: "text", half: true },
    { name: "contactSuccessTitle", label: "Contact success title", kind: "text", half: true }, { name: "contactSuccessText", label: "Contact success text", kind: "text", half: true },
    { name: "applyFormIntro", label: "Apply form intro", kind: "text" },
    { name: "applySuccessTitle", label: "Application success title", kind: "text", half: true }, { name: "applySuccessText", label: "Application success text", kind: "text", half: true },
    { name: "closedJobTitle", label: "Closed position title", kind: "text", half: true }, { name: "closedJobText", label: "Closed position text", kind: "text", half: true },
    { name: "notFoundTitle", label: "404 title", kind: "text", half: true }, { name: "notFoundText", label: "404 text", kind: "text", half: true },
  ],
};

function AccentPreview() {
  const accent = useWatch({ name: "accent" }) as string;
  const { setAccent } = useTheme();
  // Live preview across the whole admin while editing.
  useEffect(() => { if (/^#[0-9a-fA-F]{6}$/.test(accent ?? "")) setAccent(accent); }, [accent, setAccent]);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-4 sm:col-span-2" aria-label="Accent preview">
      <span className="rounded-full bg-brand-strong px-4 py-2 text-sm font-medium text-white shadow-glow">Primary button</span>
      <span className="text-sm font-medium text-brand-text underline underline-offset-4">Link text</span>
      <span className="text-gradient font-display text-xl font-semibold">Gradient headline</span>
      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-text">Chip</span>
    </div>
  );
}

export function SettingsGroupForm({ group, value, readOnly }: { group: SettingsGroup; value: Record<string, unknown>; readOnly?: boolean }) {
  const qc = useQueryClient();
  const { setAccent } = useTheme();
  const form = useForm({ resolver: zodResolver(settingsSchemas[group]), defaultValues: value });
  useEffect(() => { form.reset(value); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (group === "theme") setAccent((qc.getQueryData(["admin", "settings"]) as { theme?: { accent?: string } } | undefined)?.theme?.accent ?? null); }, [group, qc, setAccent]);

  const save = useMutation({
    mutationFn: (body: unknown) => api.put(`/admin/settings/${group}`, body),
    onSuccess: (res, body) => {
      toast.success(res.message ?? "Settings saved");
      form.reset(body as Record<string, unknown>);
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["public"] });
    },
    onError: (e) => {
      if (e instanceof ApiError && e.errors) for (const [k, v] of Object.entries(e.errors)) form.setError(k as never, { message: v[0] });
      toast.error((e as Error).message);
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
        <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
          <FormFields fields={GROUP_FIELDS[group]} />
          {group === "theme" && <AccentPreview />}
        </fieldset>
        {!readOnly && (
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
            {form.formState.isDirty && <span className="text-xs text-warning">Unsaved changes</span>}
            <Button type="button" variant="ghost" disabled={!form.formState.isDirty} onClick={() => form.reset(value)}>Discard</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />}Save</Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
