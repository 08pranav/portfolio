/**
 * The one public address of the site. Metadata, canonical and Open Graph URLs, JSON-LD, the sitemap and robots.txt
 * all read it from here. Set NEXT_PUBLIC_SITE_URL (Vercel: Production and Preview); the fallback is the live domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://pranavv.me").replace(/\/$/, "");
