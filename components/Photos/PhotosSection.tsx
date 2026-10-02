import SectionHead from "@/components/ui/SectionHead";
import PhotoStrip, { type Frame } from "./PhotoStrip";
import { base } from "@/content/base";
import { monthYear } from "@/lib/format";
import type { PhotosSection as PhotosContent } from "@/sanity/lib/types";
import styles from "./Photos.module.css";

const SHAPES: Frame["shape"][] = ["tall", "wide", "square"];

/** Through the lens: real photos from the admin, or neutral placeholder frames until the first one is uploaded. */
export default function PhotosSection({ photos }: { photos: PhotosContent }) {
  const real: Frame[] = photos.photos
    .filter((p) => p.image?.url)
    .map((p) => {
      const iso = p.exif.iso ? `ISO ${p.exif.iso}` : "";
      const place = p.place;
      return {
        id: p._id,
        real: true,
        url: p.image!.url,
        alt: p.image!.alt || `${place}, ${monthYear(p.date)}`,
        width: p.image!.width,
        height: p.image!.height,
        hotspot: p.image!.hotspot,
        shape: p.shape,
        caption: [place, monthYear(p.date)].filter(Boolean).join(", "),
        exif: [p.exif.aperture, p.exif.shutter, iso, p.exif.focalLength, place].filter(Boolean).join(" · "),
      };
    });

  const frames: Frame[] = real.length
    ? real
    : base.photos.photos.slice(0, 9).map((p, i) => ({ id: `ph-${i}`, real: false, alt: "", shape: SHAPES[i % 3], caption: "", exif: "", gradient: p.gradient }));

  return (
    <section id="photos" className={styles.photos} aria-labelledby="photos-title">
      <div className={styles.stage}>
        <div className="pad">
          <SectionHead id="photos-title" index={photos.indexLabel} tight parts={[{ text: photos.titleItalic, kind: "it" }, { text: photos.titleCaps, kind: "g" }]} side={photos.caption} />
        </div>
        <PhotoStrip frames={frames} labels={photos.labels} hints={{ scroll: photos.scrollHint, swipe: photos.swipeHint, empty: photos.emptyNote }} />
      </div>
    </section>
  );
}
