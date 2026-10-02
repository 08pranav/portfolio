import Loader from "@/components/Loader/Loader";
import Nav from "@/components/Nav/Nav";
import Hero from "@/components/Hero/Hero";
import NoteForm from "@/components/Contact/NoteForm";
import Cursor from "@/components/ui/Cursor";
import Veil from "@/components/ui/Veil";
import { getContent } from "@/sanity/lib/content";
import type { SectionKey, SectionTarget } from "@/sanity/lib/types";

export default async function Home() {
  const { site, navigation, layout, hero, work, about, photos, contact } = await getContent();

  // Homepage layout decides which sections exist and in what order
  const order: SectionKey[] = layout.sections.filter((s) => s.visible).map((s) => s.section);
  const visibleTargets: SectionTarget[] = ["top", ...order.filter((s): s is Exclude<SectionKey, "hero"> => s !== "hero")];
  const links = navigation.links.filter((l) => visibleTargets.includes(l.target));

  // TEMPORARY until the sections are built: each stub shows its heading straight from Sanity
  const stubs: Record<Exclude<SectionKey, "hero">, string> = {
    work: `${work.indexLabel} ${work.titleCaps} ${work.titleItalic} · ${work.projects.length} projects`,
    about: `${about.indexLabel} ${about.titleCaps} ${about.titleItalic} · ${about.sideLabel}`,
    photos: `${photos.indexLabel} ${photos.titleItalic} ${photos.titleCaps} · ${photos.photos.length} photos`,
    contact: `${contact.indexLabel} ${contact.headingCaps} ${contact.headingItalic}`,
  };

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.fullName,
    email: site.email,
    homeLocation: { "@type": "Place", name: site.location },
    sameAs: site.socials.map((s) => s.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      {layout.loader.enabled ? <Loader caption={layout.loader.caption} /> : null}
      <Nav navigation={{ ...navigation, links }} logoText={site.logoText} status={site.status} />
      <main id="top">
        {order.map((key) =>
          key === "hero" ? (
            <Hero key={key} hero={hero} fullName={site.fullName} status={site.status} visibleTargets={visibleTargets} />
          ) : (
            <section
              key={key}
              id={key}
              className="pad"
              style={{ minHeight: "100svh", paddingBlock: 120, ...(key === "contact" ? { background: "var(--night)", color: "var(--chalk)" } : null) }}
            >
              <span className="mono">{stubs[key]}</span>
              {key === "contact" ? (
                <div style={{ maxWidth: 640, marginTop: 48 }}>
                  <NoteForm form={contact.form} email={site.email} />
                </div>
              ) : null}
            </section>
          ),
        )}
      </main>
      <Veil />
      <Cursor />
    </>
  );
}
