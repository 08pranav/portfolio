import { proxyFile } from "@/lib/proxy-file";
import { getContent } from "@/sanity/lib/content";

/** The résumé, as a real PDF download, at this site's own address. The file itself is managed in the admin. */
export async function GET() {
  const { site } = await getContent();
  const name = site.fullName.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "Resume";
  return proxyFile(site.resume.url, `${name}-Resume.pdf`);
}
