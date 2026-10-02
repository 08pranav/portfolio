import { proxyImage } from "@/lib/proxy-image";
import { getContent } from "@/sanity/lib/content";

/** A tab icon uploaded in the admin. With none uploaded this hands back the built-in PK icon. */
export async function GET(request: Request) {
  const { site } = await getContent();
  return proxyImage(request, site.seo.favicon?.url, "/icon.svg");
}
