import { defaults } from "@/content/defaults";

/**
 * Turns the built-in defaults into Sanity document shapes (no images or files, those need uploading).
 * Used for Studio initial values and by scripts/seed.ts. Plain data: safe to import anywhere.
 */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json | undefined };

/** Sanity needs a unique _key on every object inside an array. */
export function addKeys<T>(value: T, prefix = "k"): T {
  if (Array.isArray(value)) {
    return value.map((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const obj = item as Record<string, unknown>;
        return { ...(addKeys(obj, `${prefix}${i}-`) as object), _key: (obj._key as string) ?? `${prefix}${i}` };
      }
      return item;
    }) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, addKeys(v, `${prefix}${k}-`)]),
    ) as T;
  }
  return value;
}

const d = defaults;

export function siteSettingsDoc() {
  const { resume, seo, ...rest } = d.site;
  return addKeys({
    _type: "siteSettings",
    ...rest,
    // empty `url` = a TODO to fill in the Studio; Sanity accepts the document, the Studio flags the field
    socials: d.site.socials.map((s) => ({ _type: "social", ...s })),
    resume: { updatedAt: resume.updatedAt, pages: resume.pages },
    seo: { title: seo.title, titleTemplate: seo.titleTemplate, description: seo.description },
  });
}

export function navigationDoc() {
  return addKeys({
    _type: "navigation",
    ...d.navigation,
    links: d.navigation.links.map((l) => ({ _type: "navLink", ...l })),
  });
}

export function homepageLayoutDoc() {
  return addKeys({
    _type: "homepageLayout",
    ...d.layout,
    sections: d.layout.sections.map((s) => ({ _type: "layoutSection", ...s })),
  });
}

export function heroDoc() {
  return addKeys({
    _type: "hero",
    ...d.hero,
    portraits: d.hero.portraits.map((p) => ({ _type: "portrait", alt: p.alt })),
    coverLines: d.hero.coverLines.map((c) => ({ _type: "coverLine", ...c })),
  });
}

export function projectDoc(p: (typeof d.work.projects)[number]) {
  return addKeys({
    _type: "project",
    _id: p._id,
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    year: p.year,
    urlLabel: p.urlLabel,
    description: p.description,
    built: p.built,
    hardest: p.hardest,
    stack: p.stack,
    note: p.note,
    links: p.links.map((l) => ({ _type: "projectLink", ...l })),
    themeBackground: p.theme.background,
    themeText: p.theme.text,
    archLabels: p.archLabels ?? [],
    media: p.media.map((m) => ({
      _type: "mediaItem",
      type: m.type,
      caption: m.caption,
      mock: m.mock,
      duration: m.duration,
    })),
    isHidden: false,
  });
}

/** `projectIds` are the _ids to reference, in display order. */
export function workSectionDoc(projectIds: string[] = []) {
  const { projects: _projects, ...rest } = d.work;
  void _projects;
  return addKeys({
    _type: "workSection",
    ...rest,
    projects: projectIds.map((id) => ({ _type: "reference", _ref: id })),
  });
}

export function aboutSectionDoc() {
  return addKeys({
    _type: "aboutSection",
    ...d.about,
    facts: d.about.facts.map((f) => ({ _type: "fact", ...f })),
    experience: d.about.experience.map((e) => ({ _type: "experienceItem", ...e })),
    education: d.about.education.map((e) => ({ _type: "educationItem", ...e })),
  });
}

export function photosSectionDoc() {
  const { photos: _photos, ...rest } = d.photos;
  void _photos;
  return addKeys({ _type: "photosSection", ...rest });
}

export function contactSectionDoc() {
  return addKeys({
    _type: "contactSection",
    ...d.contact,
    form: { ...d.contact.form, topics: d.contact.form.topics.map((t) => ({ _type: "topic", ...t })) },
  });
}

/** Singleton ID = type name. */
export const singletonDocs: Record<string, () => Record<string, Json | undefined>> = {
  siteSettings: siteSettingsDoc as never,
  navigation: navigationDoc as never,
  homepageLayout: homepageLayoutDoc as never,
  hero: heroDoc as never,
  workSection: workSectionDoc as never,
  aboutSection: aboutSectionDoc as never,
  photosSection: photosSectionDoc as never,
  contactSection: contactSectionDoc as never,
};
