import { proxyImage } from "@/lib/proxy-image";
import { getContent } from "@/sanity/lib/content";

/** The link-preview image (LinkedIn, WhatsApp, X). Uses the share image set in the admin, cropped to 1200 × 630. */
export async function GET(request: Request) {
  const { site } = await getContent();
  const url = site.seo.shareImage?.url;
  return proxyImage(request, url ? `${url}?w=1200&h=630&fit=crop` : undefined, "/share-default.png");
}
