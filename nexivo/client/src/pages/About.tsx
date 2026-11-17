import { Seo, breadcrumbLd } from "@/components/Seo";
import { PageSections } from "@/components/sections/PageSections";

export default function About() {
  return (
    <>
      <Seo page="ABOUT" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]} />
      <PageSections page="ABOUT" />
    </>
  );
}
