import { cache } from "react";
import { draftMode } from "next/headers";
import { defaults } from "@/content/defaults";
import { client, readToken } from "./client";
import { live } from "./live";
import { CONTENT_QUERY } from "./queries";
import type { ImageRef, SiteContent } from "./types";

type Raw = Partial<Record<keyof SiteContent, unknown>> | null;

/** GROQ returns null for empty fields. Components expect them absent. */
function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) return value.filter((v) => v !== null).map(stripNulls) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, stripNulls(v)]),
    ) as T;
  }
  return value;
}

const hasUrl = (img?: ImageRef | null): img is ImageRef => !!img?.url;

/**
 * A document that doesn't exist in the dataset yet falls back to the built-in defaults, so a fresh project still
 * renders. A document that does exist is always used as written.
 */
export function resolveContent(raw: Raw): SiteContent {
  const r = stripNulls(raw ?? {}) as Partial<SiteContent>;
  const pick = <K extends keyof SiteContent>(key: K): SiteContent[K] => (r[key] as SiteContent[K] | undefined) ?? defaults[key];

  const site = pick("site");
  const hero = pick("hero");
  const work = pick("work");
  const photos = pick("photos");

  return {
    updatedAt: (r as { updatedAt?: string }).updatedAt,
    site: {
      ...site,
      // a social link with no address yet is skipped, so unfinished entries never render as dead buttons
      errorPages: { ...defaults.site.errorPages, ...(site.errorPages ?? {}) },
      socials: (site.socials ?? []).filter((x) => !!x.url),
      resume: site.resume ?? {},
      seo: {
        ...site.seo,
        titleTemplate: site.seo?.titleTemplate || defaults.site.seo.titleTemplate,
        keywords: site.seo?.keywords ?? [],
        canonicalDomain: site.seo?.canonicalDomain?.replace(/\/$/, "") || undefined,
        jobTitle: site.seo?.jobTitle || defaults.site.seo.jobTitle,
        alumniOf: site.seo?.alumniOf ?? "",
        addressLocality: site.seo?.addressLocality ?? "",
        addressCountry: site.seo?.addressCountry ?? "",
        shareImage: hasUrl(site.seo?.shareImage) ? site.seo.shareImage : undefined,
        favicon: hasUrl(site.seo?.favicon) ? site.seo.favicon : undefined,
      },
    },
    navigation: { ...pick("navigation"), links: pick("navigation").links ?? [] },
    layout: { ...pick("layout"), sections: pick("layout").sections ?? [] },
    hero: {
      ...hero,
      // portraits need an uploaded file; until then the cover shows the built-in cutouts
      portraits: (hero.portraits ?? []).filter(hasUrl).length ? hero.portraits.filter(hasUrl) : defaults.hero.portraits,
      coverLines: hero.coverLines ?? [],
      currentlyLines: hero.currentlyLines ?? [],
      intro: hero.intro ?? [],
    },
    work: { ...work, projects: (work.projects ?? []).map((p) => ({ ...p, stack: p.stack ?? [], links: p.links ?? [], media: p.media ?? [] })) },
    about: {
      ...pick("about"),
      facts: pick("about").facts ?? [],
      lede: pick("about").lede ?? [],
      experience: pick("about").experience ?? [],
      education: pick("about").education ?? [],
      certifications: pick("about").certifications ?? [],
    },
    photos: { ...photos, emptyNote: photos.emptyNote ?? defaults.photos.emptyNote, photos: photos.photos ?? [] },
    contact: pick("contact"),
  };
}

/** Cache tag for published content. The webhook (/api/revalidate) and live events expire it. */
export const CONTENT_TAG = "sanity-content";
/** Safety net: published content is never older than this, even if no webhook or visitor ever triggers a refresh. */
const REVALIDATE_SECONDS = 60;

/**
 * Published content only: cached, refreshed every 60s at the latest and instantly by the webhook. Needs no request,
 * so it works at build time (generateStaticParams, the sitemap, robots.txt).
 */
export const getPublishedContent = cache(async (): Promise<SiteContent> => {
  if (!client) return defaults;
  try {
    const data = await client
      .withConfig({ useCdn: false, token: readToken })
      .fetch(CONTENT_QUERY, {}, { next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] } });
    return resolveContent(data as Raw);
  } catch (error) {
    // In production, failing here makes Next keep serving the last page it built successfully
    // instead of replacing it with an empty skeleton. In development, fall back so the page still renders.
    if (process.env.NODE_ENV === "production") throw error;
    console.error("Sanity fetch failed, rendering built-in content instead:", error);
    return defaults;
  }
});

/**
 * The whole site's content for a page request. Cached for the duration of a request (metadata and page share it).
 *  - Published site: as getPublishedContent.
 *  - Draft mode (the Studio's Presentation tool): drafts, streamed live as you type.
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!live || !client) return defaults;
  try {
    if ((await draftMode()).isEnabled) {
      const { data } = await live.sanityFetch({ query: CONTENT_QUERY, stega: false });
      return resolveContent(data as Raw);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.error("Sanity draft fetch failed, rendering built-in content instead:", error);
    return defaults;
  }
  return getPublishedContent();
});
