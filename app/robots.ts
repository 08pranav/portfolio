import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getPublishedContent } from "@/sanity/lib/content";

/** Everything is open to crawlers except the admin panel and the API routes. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = getSiteUrl(await getPublishedContent());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
