import type { Metadata } from "next";
import ErrorPage from "@/components/ErrorPage";
import { base } from "@/content/base";
import { fontClassNames } from "@/lib/fonts";
import { themeScript } from "@/lib/theme-script";
import { getContent } from "@/sanity/lib/content";
import "./(site)/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { site } = await getContent();
    return { title: { absolute: site.seo.titleTemplate.replace("%s", site.errorPages.notFoundTitle) }, robots: { index: false, follow: false } };
  } catch {
    return { title: base.site.errorPages.notFoundTitle, robots: { index: false, follow: false } };
  }
}

/** An address that matches no page at all. It bypasses the layouts, so it brings its own fonts, styles and theme. */
export default async function GlobalNotFound() {
  let errorPages = base.site.errorPages;
  try {
    errorPages = (await getContent()).site.errorPages;
  } catch {
    // the neutral built-in wording is fine
  }
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript("system", false) }} />
      </head>
      <body>
        <ErrorPage code="404" title={errorPages.notFoundTitle} body={errorPages.notFoundBody} homeLabel={errorPages.homeLabel} />
      </body>
    </html>
  );
}
