import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { proxyImage } from "@/lib/proxy-image";
import { getContent } from "@/sanity/lib/content";

const size = { width: 1200, height: 630 };
/** Width of "PRANAV." in ems at the masthead's weight and width, so the name can span the card exactly. */
const MASTHEAD_EM = 3.1352;

/**
 * The 1200 x 630 card shown when a project is shared. If an image was set under the project's SEO tab it is used
 * (cropped to fit); otherwise the card is built in the style of the home masthead: the PRANAV. name across the top,
 * the project name below, in the project's own colours, with its first image alongside when it has one.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, hero, work } = await getContent();
  const project = work.projects.find((p) => p.slug === slug);
  if (!project) return new Response("Not found", { status: 404 });

  const shared = project.seo?.shareImage?.url;
  if (shared) return proxyImage(request, `${shared}?w=1200&h=630&fit=crop`, "/share-default.png");

  const [masthead, serif] = await Promise.all([
    readFile(path.join(process.cwd(), "lib/og-fonts/Archivo-Masthead.ttf")),
    readFile(path.join(process.cwd(), "lib/og-fonts/Fraunces-Italic.ttf")),
  ]);

  const { background, text } = project.theme;
  const image = project.media.find((m) => m.image?.url)?.image?.url;
  const word = hero.masthead.toUpperCase();
  const fontSize = Math.min(360, Math.floor(1100 / (word === "PRANAV." ? MASTHEAD_EM : word.length * 0.4479)));
  const titleSize = project.title.length > 18 ? 76 : 96;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background, color: text, padding: "36px 50px 44px", position: "relative" }}>
        <div style={{ fontFamily: "Archivo", fontSize, lineHeight: 0.8, letterSpacing: -2, textTransform: "uppercase", display: "flex" }}>{hero.masthead}</div>
        <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: image ? 620 : 1000 }}>
            <div style={{ fontFamily: "Archivo", fontSize: 28, letterSpacing: 2, textTransform: "uppercase", opacity: 0.75, display: "flex" }}>
              {`${project.year} · ${site.seo.jobTitle}`}
            </div>
            <div style={{ fontFamily: "Fraunces", fontStyle: "italic", fontSize: titleSize, lineHeight: 1, letterSpacing: -2, display: "flex" }}>{project.title}</div>
          </div>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${image}?w=840&h=560&fit=crop&fm=jpg`} width={420} height={280} alt="" style={{ borderRadius: 14, objectFit: "cover", border: `2px solid ${text}` }} />
          ) : null}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: masthead.buffer.slice(masthead.byteOffset, masthead.byteOffset + masthead.byteLength) as ArrayBuffer, weight: 800, style: "normal" },
        { name: "Fraunces", data: serif.buffer.slice(serif.byteOffset, serif.byteOffset + serif.byteLength) as ArrayBuffer, weight: 400, style: "italic" },
      ],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
