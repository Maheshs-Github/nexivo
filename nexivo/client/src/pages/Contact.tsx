import { lazy, Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useSettings } from "@/hooks/usePublic";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { PageSections } from "@/components/sections/PageSections";

// The form (React Hook Form + Zod) loads after the page header, so the header paints first.
const ContactForm = lazy(() => import("@/components/forms/ContactForm"));
import { Shimmer } from "@/components/ui/states";

function ContactCards() {
  const { data: s, isLoading } = useSettings();
  if (isLoading || !s) return <div className="space-y-3">{[0, 1, 2].map((i) => <Shimmer key={i} className="h-24" />)}</div>;
  const c = s.contact;
  const cards = [
    c.email && { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}`, extra: c.salesEmail && c.salesEmail !== c.email ? `New projects: ${c.salesEmail}` : undefined },
    c.phone && { icon: Phone, label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}`, extra: c.whatsapp ? `WhatsApp: ${c.whatsapp}` : undefined },
    c.address && { icon: MapPin, label: "Studio", value: c.address, extra: c.city },
    c.hours && { icon: Clock, label: "Hours", value: c.hours },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string; extra?: string }[];
  return (
    <div className="space-y-6">
      <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line">
        {cards.map((card) => (
          <li key={card.label} className="flex gap-4 bg-bg p-5 md:p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-brand-text"><card.icon className="size-4" aria-hidden /></span>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{card.label}</p>
              {card.href ? <a href={card.href} className="break-words font-medium hover:text-brand-text">{card.value}</a> : <p className="font-medium">{card.value}</p>}
              {card.extra && <p className="mt-0.5 text-sm text-text-muted">{card.extra}</p>}
            </div>
          </li>
        ))}
      </ul>
      {c.mapEmbedUrl && (
        <div className="overflow-hidden rounded-3xl border border-line">
          <iframe title={`Map: ${c.address || "our studio"}`} src={c.mapEmbedUrl} width={600} height={320} loading="lazy" referrerPolicy="no-referrer"
            className="block h-72 w-full grayscale-[0.6] dark:invert-[0.9] dark:hue-rotate-180" />
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  return (
    <>
      <Seo page="CONTACT" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]} />
      <PageSections page="CONTACT" only={["PAGE_HEADER"]} />
      <section className="section pt-12 md:pt-16">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7"><Suspense fallback={<Shimmer className="h-[42rem] rounded-3xl" />}><ContactForm /></Suspense></div>
          <div className="lg:col-span-5"><ContactCards /></div>
        </div>
      </section>
      <PageSections page="CONTACT" exclude={["PAGE_HEADER"]} />
    </>
  );
}
