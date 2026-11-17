import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useNav, useSettings } from "@/hooks/usePublic";
import { ActionLink, SmartLink } from "@/components/ui/action-link";
import type { NavItem } from "@/lib/types";
import { Logo } from "./Brand";
import { useChrome } from "./chrome-context";

const SOCIAL_LABELS: Record<string, string> = { linkedin: "LinkedIn", x: "X", github: "GitHub", instagram: "Instagram", dribbble: "Dribbble", youtube: "YouTube" };

export function Footer() {
  const { data: s } = useSettings();
  const { data: nav } = useNav();
  const { footerCta } = useChrome();

  const groups = (nav?.footer ?? []).reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group || "Links"] ??= []).push(item);
    return acc;
  }, {});
  const socials = s ? Object.entries(s.social).filter(([, url]) => url) : [];

  return (
    <footer className="relative mt-auto border-t border-line bg-bg-elevated">
      {footerCta && s?.footer.ctaHeading && (
        <div className="container-x flex flex-col items-start justify-between gap-6 border-b border-line py-14 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-display text-h2 font-semibold">{s.footer.ctaHeading}</p>
            {s.footer.ctaText && <p className="lead mt-3">{s.footer.ctaText}</p>}
          </div>
          {s.footer.ctaLabel && s.footer.ctaUrl && <ActionLink href={s.footer.ctaUrl} size="lg" arrow>{s.footer.ctaLabel}</ActionLink>}
        </div>
      )}

      <div className="container-x grid gap-12 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo name={s?.general.siteName} logo={s?.general.logo} />
          {s?.footer.about && <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">{s.footer.about}</p>}
          {s?.contact && (
            <ul className="mt-6 space-y-2.5 text-sm text-text-muted">
              {s.contact.email && <li><a className="inline-flex items-center gap-2.5 hover:text-text" href={`mailto:${s.contact.email}`}><Mail className="size-4" aria-hidden />{s.contact.email}</a></li>}
              {s.contact.phone && <li><a className="inline-flex items-center gap-2.5 hover:text-text" href={`tel:${s.contact.phone.replace(/\s/g, "")}`}><Phone className="size-4" aria-hidden />{s.contact.phone}</a></li>}
              {s.contact.city && <li className="inline-flex items-center gap-2.5"><MapPin className="size-4" aria-hidden />{s.contact.city}</li>}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:justify-items-end">
          {Object.entries(groups).map(([group, items]) => (
            <nav key={group} aria-label={group} className="min-w-36">
              <p className="eyebrow mb-4">{group}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.id}><SmartLink href={item.url} className="text-sm text-text-muted transition-colors hover:text-text">{item.label}</SmartLink></li>
                ))}
              </ul>
            </nav>
          ))}
          {socials.length > 0 && (
            <nav aria-label="Social" className="min-w-36">
              <p className="eyebrow mb-4">Follow</p>
              <ul className="space-y-2.5">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text">
                      {SOCIAL_LABELS[key] ?? key}<ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      <div className="container-x flex flex-col gap-3 border-t border-line py-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {s?.footer.copyright}</p>
        {s?.general.tagline && <p className="font-display">{s.general.tagline}</p>}
      </div>
    </footer>
  );
}
