/**
 * Serves an editor-uploaded image from this site's own address. Link previews and the tab icon then point at
 * /share.png and /site-icon instead of the image host, and the picture can still be changed in the admin.
 */
export async function proxyImage(request: Request, sourceUrl: string | undefined, fallbackPath: string) {
  const fallback = () => Response.redirect(new URL(fallbackPath, request.url), 302);
  if (!sourceUrl) return fallback();
  try {
    const upstream = await fetch(sourceUrl, { next: { revalidate: 3600 } });
    if (!upstream.ok || !upstream.body) return fallback();
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return fallback();
  }
}
