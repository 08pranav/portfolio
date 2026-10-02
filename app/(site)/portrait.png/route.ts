import { proxyImage } from "@/lib/proxy-image";
import { getContent } from "@/sanity/lib/content";

/** The first cover portrait, at this site's own address, for the Person structured data. */
export async function GET(request: Request) {
  const { hero } = await getContent();
  return proxyImage(request, hero.portraits[0]?.url, "/portrait/grey-tee.webp");
}
