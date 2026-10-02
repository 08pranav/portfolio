import type { CoverLine, Project, SectionTarget, SiteContent } from "@/sanity/lib/types";
import { base, rich } from "./base";
import type { Seed } from "./seed-type";

/**
 * Your real content: content/seed.json laid over the neutral skeleton in content/base.ts. seed.json is a local file that
 * is not published, so when it is absent (a fresh clone, or Vercel) this is just the skeleton and the site reads
 * everything from Sanity. It is
 *  - what `npm run seed` writes into Sanity,
 *  - the initial value for new Studio documents,
 *  - the fallback the site renders if Sanity isn't configured or a document doesn't exist yet.
 * Once the Studio is connected, whatever is edited there wins.
 *
 * "TODO" in seed.json means "not provided yet": those values are left empty.
 */

/** True for anything that is not real content yet. */
export const isTodo = (v: unknown) => typeof v !== "string" || v.trim() === "" || /^TODO\b/i.test(v.trim());
const text = (v: unknown) => (isTodo(v) ? "" : (v as string));

/** "plain *italic* plain" -> one paragraph of rich text with italic accents. */
function fromMarkdown(src: string) {
  const parts = src.split(/\*([^*]+)\*/);
  return rich(...parts.map((p, i) => (i % 2 ? { it: p } : p)).filter((p) => p !== ""));
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const MEDIA_TYPE = { phone: "mobile", desk: "image", arch: "diagram" } as const;

function applySeed(seed: Seed): SiteContent {
  const { site: s, hero: h, about: a, contact: c } = seed;

  const projects: Project[] = seed.projects.map((p) => ({
    _id: `project-${slugify(p.title)}`,
    slug: slugify(p.title),
    year: p.year,
    title: p.title,
    urlLabel: p.urlLabel,
    description: p.description,
    built: p.built,
    hardest: p.hardest,
    stack: p.stack,
    links: p.links,
    note: p.note ?? undefined,
    theme: { background: p.accent.bg, text: p.accent.fg },
    archLabels: p.architecture,
    media: p.media.map((m) => ({ type: MEDIA_TYPE[m.kind as keyof typeof MEDIA_TYPE], caption: m.caption })),
  }));

  const years = projects.map((p) => Number(p.year));

  const coverLines: CoverLine[] = h.covers.map((line) => ({
    label: line.label,
    bigNumber: "number" in line ? line.number : undefined,
    textSource: line.text === "{site.statusText}" ? "status" : line.text === "{rotating}" ? "currently" : "custom",
    text: line.text.startsWith("{") ? undefined : line.text,
    linkLabel: `${line.link} ↗`,
    linkTarget: line.target as SectionTarget,
  }));

  return {
    site: {
      ...base.site,
      fullName: s.name,
      logoText: s.logo,
      email: s.email,
      location: s.location,
      timeZone: s.timeZone,
      status: { openToWork: s.openToWork, shortText: base.site.status.shortText, text: s.statusText },
      // a TODO link stays in the list with an empty address, so it shows up in the Studio ready to fill; the site skips it
      socials: s.socials.map((x) => ({ platform: x.platform as SiteContent["site"]["socials"][number]["platform"], url: text(x.url) })),
      seo: {
        title: s.name,
      titleTemplate: `%s — ${s.name}`,
        description: `Portfolio of ${s.name}, B.Tech Computer Engineering student at Fr. CRCE, Mumbai. Web, mobile and Ethereum projects, and Project Cell leadership.`,
      },
    },

    navigation: {
      ...base.navigation,
      // the status sentence is the only availability line that is on the résumé, so the mobile menu reuses it
      menuFooterLeft: s.statusText.length <= 60 ? s.statusText : base.site.status.shortText,
    },

    layout: base.layout,

    hero: {
      ...base.hero,
      issue: { left: h.issue[0], center: h.issue[1], right: h.issue[2] === "{clock}" ? base.hero.issue.right : h.issue[2] },
      masthead: h.masthead,
      coverLines,
      currentlyLines: h.currently,
      intro: fromMarkdown(h.intro),
    },

    work: {
      ...base.work,
      subtitle: `${Math.min(...years)} – ${Math.max(...years)} · click a project to open it`,
      projects,
    },

    about: {
      ...base.about,
      sideLabel: s.location,
      lede: fromMarkdown(a.lede),
      facts: a.facts.map(([label, value]) => ({ label, value })),
      experience: a.experience.map((e) => ({ when: e.when, role: e.role, org: e.org, text: e.text })),
      education: a.education.map((e) => ({ when: e.when, title: e.title, org: e.org, note: e.note })),
      certifications: a.certifications,
    },

    // Real photos are still TODO. The stand-in frames in base.ts only show if the Photos section isn't in the dataset.
    photos: base.photos,

    contact: {
      ...base.contact,
      headingCaps: c.heading[0],
      headingItalic: c.heading[1],
      labels: { ...base.contact.labels, locationLine: `Based in ${s.location}` },
      form: { ...base.contact.form, topics: c.topics.map((t) => ({ label: t, value: t })) },
      footer: { ...base.contact.footer, signature: c.footerSignature, copyright: c.copyright },
    },
  };
}

/** content/seed.json is optional and never published. */
function loadSeed(): Seed | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./seed.json") as Seed;
  } catch {
    return null;
  }
}

const seed = loadSeed();
export const defaults: SiteContent = seed ? applySeed(seed) : base;

