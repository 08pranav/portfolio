import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getPublishedContent } from "@/sanity/lib/content";

/** The home page and every visible project, each with the date it was last edited. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent();
  const base = getSiteUrl(content);
  const asDate = (iso?: string) => (iso ? new Date(iso) : undefined);
  return [
    { url: base, lastModified: asDate(content.updatedAt), changeFrequency: "monthly", priority: 1 },
    ...content.work.projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: asDate(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
