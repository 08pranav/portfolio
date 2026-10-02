import type { Metadata } from "next";
import Loader from "@/components/Loader/Loader";
import Hero from "@/components/Hero/Hero";
import NoteForm from "@/components/Contact/NoteForm";
import SiteChrome from "@/components/SiteChrome";
import SiteFooter from "@/components/SiteFooter";
import RevealObserver from "@/components/ui/RevealObserver";
import RichText from "@/components/ui/RichText";
import SectionHead from "@/components/ui/SectionHead";
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

  // The About, Photos and Contact sections are still being built: for now each renders its heading and basics.
  const section = (key: SectionKey) => {
    switch (key) {
      case "work":
        return <WorkSection key={key} work={work} />;
      case "about":
        return (
          <section key={key} id="about" className="sect pad" aria-labelledby="about-title">
            <SectionHead id="about-title" index={about.indexLabel} parts={[{ text: about.titleCaps, kind: "g" }, { text: about.titleItalic, kind: "it" }]} side={about.sideLabel} />
            <p style={{ maxWidth: "46ch", fontSize: "clamp(20px, 2.4vw, 30px)", lineHeight: 1.2 }}><RichText value={about.lede} /></p>
          </section>
        );
      case "photos":
        return (
          <section key={key} id="photos" className="sect pad" aria-labelledby="photos-title" style={{ paddingBottom: 80 }}>
            <SectionHead id="photos-title" index={photos.indexLabel} parts={[{ text: photos.titleItalic, kind: "it" }, { text: photos.titleCaps, kind: "g" }]} side={photos.caption} />
          </section>
        );
      case "contact":
        return (
          <section key={key} id="contact" className="sect pad" aria-labelledby="contact-title" style={{ background: "var(--night)", color: "var(--chalk)", marginTop: "clamp(88px, 11vw, 160px)", paddingBottom: 80 }}>
            <SectionHead id="contact-title" index={contact.indexLabel} lines parts={[{ text: contact.headingCaps, kind: "g" }, { text: contact.headingItalic, kind: "it" }]} />
            <div style={{ maxWidth: 640 }}><NoteForm form={contact.form} email={site.email} /></div>
          </section>
        );
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
