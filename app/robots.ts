import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** Everything is open to crawlers except the admin panel and the API routes. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
