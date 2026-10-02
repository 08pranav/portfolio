import type { Metadata } from "next";
import Loader from "@/components/Loader/Loader";
import Hero from "@/components/Hero/Hero";
import AboutSection from "@/components/About/AboutSection";
import ContactSection from "@/components/Contact/ContactSection";
import PhotosSection from "@/components/Photos/PhotosSection";
import SiteChrome from "@/components/SiteChrome";
import SiteFooter from "@/components/SiteFooter";
import RevealObserver from "@/components/ui/RevealObserver";
import RichText from "@/components/ui/RichText";
import WorkSection from "@/components/Work/WorkSection";
import { homeGraph, jsonLd } from "@/lib/seo";
import { getContent } from "@/sanity/lib/content";
import type { SectionKey, SectionTarget } from "@/sanity/lib/types";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const LIGHT = new Set<SectionKey>(["work", "about", "photos"]);

export default async function Home() {
  const content = await getContent();
  const { site, layout, hero, work, about, photos, contact } = content;

  // Homepage layout decides which sections exist and in what order
  const order: SectionKey[] = layout.sections.filter((s) => s.visible).map((s) => s.section);
  const targets: SectionTarget[] = ["top", ...order.filter((s): s is Exclude<SectionKey, "hero"> => s !== "hero")];

  const section = (key: SectionKey) => {
    switch (key) {
      case "work":
        return <WorkSection key={key} work={work} />;
      case "about":
        return <AboutSection key={key} about={about} resume={site.resume} />;
      case "photos":
        return <PhotosSection key={key} photos={photos} />;
      case "contact":
        return <ContactSection key={key} contact={contact} site={site} />;
      default:
        return null;
    }
  };

  const blocks: React.ReactNode[] = [];
  let run: React.ReactNode[] = [];
  const flush = () => {
    if (run.length) blocks.push(<div className="light" key={`light-${blocks.length}`}>{run}</div>);
    run = [];
  };
  for (const key of order) {
    if (key === "hero") {
      flush();
      blocks.push(<Hero key="hero" hero={hero} fullName={site.fullName} status={site.status} visibleTargets={targets} intro={<RichText value={hero.intro} />} />);
    } else if (LIGHT.has(key)) run.push(section(key));
    else {
      flush();
      blocks.push(section(key));
    }
  }
  flush();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(homeGraph(content)) }} />
      {layout.loader.enabled ? <Loader caption={layout.loader.caption} /> : null}
      <SiteChrome content={content} targets={targets} />
      <main id="top">{blocks}</main>
      <SiteFooter contact={contact} />
      <RevealObserver />
    </>
  );
}
