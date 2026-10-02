import type { Metadata } from "next";
import { NextStudioLayout, metadata as studioMetadata } from "next-sanity/studio";
import { getContent } from "@/sanity/lib/content";

export { viewport } from "next-sanity/studio";

/** The admin tab reads "Admin — <site name>", from the same title template as the rest of the site. */
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return { ...studioMetadata, robots: { index: false, follow: false }, title: site.seo.titleTemplate.replace("%s", "Admin") };
}

/** The Studio gets its own root layout: none of the site's fonts, smooth scroll or theme script. */
export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <NextStudioLayout>{children}</NextStudioLayout>
      </body>
    </html>
  );
}
