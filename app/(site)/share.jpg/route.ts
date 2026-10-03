import { proxyImage } from "@/lib/proxy-image";
import { shareImageSource } from "@/lib/seo";
import { getContent } from "@/sanity/lib/content";

/** The link-preview and search thumbnail: the Share image from Site settings, as a 1200 × 630 JPG on a solid background. */
export async function GET(request: Request) {
  const { site } = await getContent();
  return proxyImage(request, shareImageSource(site.seo.shareImage?.url), "/share-default.jpg");
}
