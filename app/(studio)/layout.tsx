import { NextStudioLayout } from "next-sanity/studio";

export { metadata, viewport } from "next-sanity/studio";

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
