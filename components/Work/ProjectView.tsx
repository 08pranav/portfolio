"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Roll from "@/components/ui/Roll";
import MediaStandIn from "./MediaStandIn";
import type { ImageRef, MediaItem, Project, WorkSection } from "@/sanity/lib/types";
import styles from "./ProjectView.module.css";

const two = (n: number) => String(n).padStart(2, "0");

type Props = {
  project: Project;
  index: number;
  total: number;
  next: { slug: string; title: string };
  labels: WorkSection["labels"];
  /** overlay: shown over the home page. page: the project's own address, opened directly. */
  mode: "overlay" | "page";
  onClose?: () => void;
  rootRef?: React.Ref<HTMLDivElement>;
};

const kindLabel = (m: MediaItem, l: WorkSection["labels"]) =>
  m.type === "mobile" ? l.kindMobile : m.type === "diagram" ? l.kindDiagram : m.type === "image" ? l.kindImage : l.kindVideo;

const focalPoint = (img?: ImageRef) => (img?.hotspot ? { objectPosition: `${img.hotspot.x * 100}% ${img.hotspot.y * 100}%` } : undefined);

/**
 * Everything on a project's page. All the text is rendered on the server, so it is in the HTML crawlers receive;
 * the gallery just changes which slide is shown.
 */
export default function ProjectView({ project: p, index, total, next, labels, mode, onClose, rootRef }: Props) {
  const [gi, setGi] = useState(0);
  const n = p.media.length;
  const dragStart = useRef<number | null>(null);
  const isPage = mode === "page";
  const Title = isPage ? "h1" : "h2";
  const Sub = isPage ? "h2" : "h3";

  const show = (i: number) => n > 0 && setGi((i + n) % n);

  // arrow keys move through the gallery
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement | null)?.tagName ?? "")) return;
      if (e.key === "ArrowRight") setGi((g) => (g + 1) % Math.max(1, n));
      if (e.key === "ArrowLeft") setGi((g) => (g - 1 + Math.max(1, n)) % Math.max(1, n));
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [n]);

  // only the slide in view may play
  const galRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    galRef.current?.querySelectorAll("video").forEach((v, i) => {
      if (i !== gi) v.pause();
    });
  }, [gi]);

  const slide = (m: MediaItem, i: number) => {
    const sizes = "(max-width: 860px) 100vw, 58vw";
    if ((m.type === "videoFile" || m.type === "videoUrl") && m.videoUrl)
      return <video src={m.videoUrl} poster={m.poster?.url} controls playsInline muted preload="none" aria-label={m.caption} />;
    if (m.image?.url)
      return (
        <Image
          src={m.image.url}
          alt={m.image.alt || m.caption}
          fill
          sizes={sizes}
          style={focalPoint(m.image)}
          priority={isPage && i === 0}
          fetchPriority={isPage && i === 0 ? "high" : undefined}
        />
      );
    return <MediaStandIn project={p} item={m} />;
  };

  const thumb = (m: MediaItem) => {
    if (m.image?.url) return <span className={styles.thumbImg}><Image src={m.image.url} alt="" fill sizes="120px" style={focalPoint(m.image)} /></span>;
    if (m.type === "videoFile" || m.type === "videoUrl") {
      if (m.poster?.url) return <span className={styles.thumbImg}><Image src={m.poster.url} alt="" fill sizes="120px" /></span>;
    }
    return <div className={styles.mini} aria-hidden="true"><MediaStandIn project={p} item={m} thumb /></div>;
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.case} ${isPage ? styles.page : styles.overlay}`}
      {...(isPage ? {} : { role: "dialog", "aria-modal": true, "aria-labelledby": "project-title", "data-lenis-prevent": "" })}
    >
      <div className={styles.bar3}>
        <span className="mono">{`(${p.year})  ${two(index + 1)} / ${two(total)}`}</span>
        {onClose ? (
          <button type="button" onClick={onClose}><Roll text={`(${labels.close})`} /></button>
        ) : (
          <Link href="/#work" className="ctl"><Roll text={`(${labels.close})`} /></Link>
        )}
      </div>

      <div className={styles.cmain}>
        <div className={styles.gal}>
          <div
            ref={galRef}
            className={styles.galMain}
            aria-roledescription="carousel"
            onPointerDown={(e) => { dragStart.current = e.clientX; }}
            onPointerUp={(e) => {
              if (dragStart.current !== null && Math.abs(e.clientX - dragStart.current) > 40) show(gi + (e.clientX < dragStart.current ? 1 : -1));
              dragStart.current = null;
            }}
          >
            {p.media.map((m, i) => (
              <figure key={i} className={`${styles.slide} ${i === gi ? styles.on : ""}`} aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>
                {slide(m, i)}
                {/* every slide's caption is real text in the page, not only the one on screen */}
                <figcaption className="sr">{m.caption}</figcaption>
              </figure>
            ))}
          </div>
          {n > 0 ? (
            <>
              <div className={styles.galBar}>
                <button type="button" aria-label={labels.prev} onClick={() => show(gi - 1)}><Roll text={`(${labels.prev})`} /></button>
                <span className={`mono ${styles.galCap}`} aria-live="polite">{`${two(gi + 1)} / ${two(n)} · ${p.media[gi].caption}`}</span>
                <button type="button" aria-label={labels.next} onClick={() => show(gi + 1)}><Roll text={`(${labels.next})`} /></button>
              </div>
              <div className={styles.thumbs}>
                {p.media.map((m, i) => (
                  <button key={i} type="button" className={`${styles.thumb} ${i === gi ? styles.on : ""}`} aria-label={`${kindLabel(m, labels)}: ${m.caption}`} aria-current={i === gi} onClick={() => show(i)}>
                    {thumb(m)}
                    <span className={styles.kind}>{kindLabel(m, labels)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className={styles.cinfo}>
          <Title id="project-title" className={`it ${styles.title}`}>{p.title}</Title>
          <p className={styles.lead}>{p.description}</p>
          <div><Sub className={styles.sub}>{labels.built}</Sub><p className={styles.s}>{p.built}</p></div>
          <div><Sub className={styles.sub}>{labels.hardest}</Sub><p className={styles.s}>{p.hardest}</p></div>
          <div>
            <Sub className={styles.sub}>{labels.stack}</Sub>
            <ul className={styles.chips}>{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          {p.links.length || p.note ? (
            <div className={styles.acts}>
              {p.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"><Roll text={`(${l.label})`} /></a>
              ))}
              {p.note ? <p className={`mono ${styles.note}`}>{p.note}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.cfoot}>
        <span className="mono">{labels.nextProject}</span>
        <Link href={`/projects/${next.slug}`} replace scroll={false} className={styles.next}><Roll text={next.title} /></Link>
      </div>
    </div>
  );
}
