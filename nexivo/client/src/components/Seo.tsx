import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { usePageSeo, useSettings } from "@/hooks/usePublic";
import type { PageKey } from "@/lib/types";

interface Props {
  /** Page-level SEO from the admin (PageSEO table). Explicit title/description override it. */
  page?: PageKey;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
}

const origin = () => (typeof window === "undefined" ? "" : window.location.origin);
export const absolute = (url?: string | null) => (!url ? undefined : /^https?:\/\//.test(url) ? url : `${origin()}${url.startsWith("/") ? "" : "/"}${url}`);

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

/** One SEO component for every page: title template, canonical, Open Graph, Twitter and JSON-LD. */
export function Seo({ page, title, description, image, type = "website", jsonLd = [], noindex }: Props) {
  const { pathname } = useLocation();
  const { data: settings } = useSettings();
  const { data: pageSeo } = usePageSeo(page ?? "HOME");
  const seo = settings?.seo;
  const fromPage = page ? pageSeo : null;

  const rawTitle = title ?? fromPage?.title ?? seo?.defaultTitle ?? settings?.general.siteName ?? "";
  const isHome = pathname === "/";
  const template = seo?.titleTemplate || "%s";
  const fullTitle = isHome || !rawTitle || rawTitle === seo?.defaultTitle || !template.includes("%s") ? rawTitle : template.replace("%s", rawTitle);
  const desc = description ?? fromPage?.description ?? seo?.defaultDescription ?? settings?.general.description ?? "";
  const ogImage = absolute(image ?? fromPage?.ogImage ?? seo?.ogImage);
  const canonical = `${origin()}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
  const siteName = settings?.general.siteName ?? "";

  return (
    <Helmet prioritizeSeoTags>
      {fullTitle && <title>{fullTitle}</title>}
      {desc && <meta name="description" content={desc} />}
      {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      {siteName && <meta property="og:site_name" content={siteName} />}
      {fullTitle && <meta property="og:title" content={fullTitle} />}
      {desc && <meta property="og:description" content={desc} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      {seo?.twitterHandle && <meta name="twitter:site" content={seo.twitterHandle} />}
      {fullTitle && <meta name="twitter:title" content={fullTitle} />}
      {desc && <meta name="twitter:description" content={desc} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd.map((ld, i) => <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>)}
    </Helmet>
  );
}

/** Organization JSON-LD, rendered once by the public layout. */
export function OrganizationLd() {
  const { data: s } = useSettings();
  if (!s) return null;
  const sameAs = Object.values(s.social).filter(Boolean);
  const ld = {
    "@context": "https://schema.org", "@type": "Organization", name: s.general.siteName, url: origin(), description: s.general.description,
    logo: absolute(s.general.logo || "/favicon.svg"), email: s.contact.email || undefined, telephone: s.contact.phone || undefined,
    address: s.contact.address ? { "@type": "PostalAddress", streetAddress: s.contact.address, addressLocality: s.contact.city } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
  return <Helmet><script type="application/ld+json">{JSON.stringify(ld)}</script></Helmet>;
}
