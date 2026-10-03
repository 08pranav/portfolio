import { SITE_URL } from "./site-url";
import type { Project, SiteContent } from "@/sanity/lib/types";

/** Cuts text to roughly `max` characters at a word boundary, for meta descriptions. */
export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 25))}…`;
}

/** JSON for a <script type="application/ld+json">, safe against "</script>" inside a value. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const SAME_AS = new Set(["GitHub", "LinkedIn"]);

/** Home page: who the site is about, and the site itself. */
export function homeGraph(content: SiteContent) {
  const { site } = content;
  const base = SITE_URL;
  const sameAs = site.socials.filter((s) => SAME_AS.has(s.platform) && s.url).map((s) => s.url);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${base}/#person`,
        name: site.fullName,
        jobTitle: site.seo.jobTitle,
        ...(site.seo.alumniOf ? { alumniOf: { "@type": "CollegeOrUniversity", name: site.seo.alumniOf } } : {}),
        address: { "@type": "PostalAddress", addressLocality: site.seo.addressLocality, addressCountry: site.seo.addressCountry },
        email: site.email,
        image: `${base}/portrait.png`,
        url: base,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: site.fullName,
        description: site.seo.description,
        inLanguage: "en",
        publisher: { "@id": `${base}/#person` },
      },
    ],
  };
}

/** A project page: the work itself, and where it sits in the site. */
export function projectGraph(content: SiteContent, project: Project) {
  const { site, work } = content;
  const base = SITE_URL;
  const url = `${base}/projects/${project.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: project.title,
        description: project.seo?.metaDescription || project.description,
        dateCreated: project.year,
        author: { "@type": "Person", "@id": `${base}/#person`, name: site.fullName, url: base },
        image: `${url}/og`,
        url,
        keywords: project.stack.join(", "),
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          { "@type": "ListItem", position: 2, name: `${work.titleCaps} ${work.titleItalic}`.trim(), item: `${base}/#work` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}
