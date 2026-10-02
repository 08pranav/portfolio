import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, Martian_Mono } from "next/font/google";
import { revalidateTag, updateTag } from "next/cache";
import { draftMode } from "next/headers";
import { parseTags } from "next-sanity/live";
import { VisualEditing } from "next-sanity/visual-editing";
import MotionProvider from "@/components/providers/MotionProvider";
import SiteConfigProvider from "@/components/providers/SiteConfigProvider";
import { CONTENT_TAG, getContent } from "@/sanity/lib/content";
import { live } from "@/sanity/lib/live";
import { siteUrl } from "@/lib/site-url";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-martian-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  const { title, titleTemplate, description, favicon } = site.seo;
  return {
    metadataBase: new URL(siteUrl()),
    // home page reads `title`; every other page (and the admin) reads the template, e.g. "Admin — Pranav Koradiya"
    title: { default: title, template: titleTemplate },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: site.fullName,
      images: [{ url: "/share.png", width: 1200, height: 630, alt: site.fullName }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/share.png"] },
    // no custom icon uploaded: the built-in PK icons (app/icon.svg, favicon.ico, apple-icon.png) apply
    icons: favicon ? { icon: "/site-icon" } : undefined,
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEEFF0" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getContent();
  // reading draft mode makes the page dynamic, so only do it when Sanity is connected
  const isDraft = live ? (await draftMode()).isEnabled : false;

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fraunces.variable} ${martianMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(site.defaultTheme) }} />
      </head>
      <body>
        <SiteConfigProvider timeZone={site.timeZone} titleTemplate={site.seo.titleTemplate}>
          <MotionProvider>{children}</MotionProvider>
        </SiteConfigProvider>
        {live ? (
          <live.SanityLive
            includeDrafts={isDraft}
            // next-sanity 13 only marks the cache stale by default, so visitors would need a refresh to see an edit.
            // Expiring the tag instead means a published edit shows up within seconds, even for people already on the page.
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
        ) : null}
        {isDraft ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
