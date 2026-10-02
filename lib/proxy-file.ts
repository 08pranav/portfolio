/** Serves an uploaded file (the résumé PDF) from this site's own address, as a download. */
export async function proxyFile(sourceUrl: string | undefined, filename: string, contentType = "application/pdf") {
  if (!sourceUrl) return new Response("Not found", { status: 404 });
  try {
    const upstream = await fetch(sourceUrl, { next: { revalidate: 3600 } });
    if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
