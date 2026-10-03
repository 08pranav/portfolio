import type { Metadata, Viewport } from "next";
import { revalidateTag, updateTag } from "next/cache";
import { draftMode } from "next/headers";
import { parseTags } from "next-sanity/live";
import { VisualEditing } from "next-sanity/visual-editing";
import MotionProvider from "@/components/providers/MotionProvider";
import SiteConfigProvider from "@/components/providers/SiteConfigProvider";
import { CONTENT_TAG, getContent } from "@/sanity/lib/content";
import { live } from "@/sanity/lib/live";
import { fontClassNames } from "@/lib/fonts";
import { shareImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { site } = content;
  const { title, titleTemplate, description, keywords, favicon } = site.seo;
  const isDraft = live ? (await draftMode()).isEnabled : false;
  const share = shareImage(content);
  return {
    metadataBase: new URL(SITE_URL),
    // home page reads `title`; every other page (and the admin) reads the template, e.g. "Admin — Pranav Koradiya"
    title: { default: title, template: titleTemplate },
    description,
    keywords: keywords.length ? keywords : undefined,
    authors: [{ name: site.fullName }],
    creator: site.fullName,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: site.fullName,
      url: "/",
      locale: "en_IN",
      images: [share],
    },
    twitter: { card: "summary_large_image", title, description, images: [share] },
    // no custom icon uploaded: the built-in PK icons (app/icon.svg, favicon.ico, apple-icon.png) apply
    icons: favicon ? { icon: "/site-icon" } : undefined,
    // previews of unpublished drafts must never be indexed
    robots: isDraft ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" },
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEEFF0" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default async function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const { site, layout } = await getContent();
  // reading draft mode makes the page dynamic, so only do it when Sanity is connected
  const isDraft = live ? (await draftMode()).isEnabled : false;

  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(site.defaultTheme, layout.loader.enabled) }} />
      </head>
      <body>
        <SiteConfigProvider timeZone={site.timeZone} titleTemplate={site.seo.titleTemplate} errorPages={site.errorPages}>
          <MotionProvider>
            {children}
            {modal}
          </MotionProvider>
        </SiteConfigProvider>
        {/* Live updates and click-to-edit only exist inside the admin's preview; visitors never load them. */}
        {live && isDraft ? (
          <>
            <live.SanityLive
              includeDrafts
              action={async (unsafeTags) => {
                "use server";
                const { isEnabled } = await draftMode();
                const { tags } = parseTags(unsafeTags);
                for (const tag of tags) {
                  if (isEnabled) revalidateTag(tag, "max");
                  else updateTag(tag);
                }
                if (isEnabled) return "refresh";
                updateTag(CONTENT_TAG);
              }}
            />
            <VisualEditing />
          </>
        ) : null}
      </body>
    </html>
  );
}
