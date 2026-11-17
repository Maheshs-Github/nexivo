import { Seo } from "@/components/Seo";
import { PageSections } from "@/components/sections/PageSections";

export default function Home() {
  return (
    <>
      <Seo page="HOME" />
      <PageSections page="HOME" />
    </>
  );
}
