"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Roll from "@/components/ui/Roll";
import { afterPaint, initMotion, loadGsap, lockScroll, unlockScroll } from "@/lib/motion";
import { pad } from "@/lib/format";
import styles from "./Photos.module.css";

export type Frame = {
  id: string;
  /** false = a neutral placeholder shown until real photos are uploaded */
  real: boolean;
  url?: string;
  alt: string;
  width?: number;
  height?: number;
  hotspot?: { x: number; y: number };
  shape: "tall" | "wide" | "square";
  /** "Bandstand, Jan 2026" */
  caption: string;
  /** "f/2.8 · 1/500s · ISO 160 · 35mm · Bandstand" */
  exif: string;
  gradient?: string;
};

type Props = {
  frames: Frame[];
  labels: { view: string; close: string; prev: string; next: string };
  hints: { scroll: string; swipe: string; empty: string };
};

const SHAPE: Record<Frame["shape"], string> = { tall: styles.t, wide: styles.w, square: styles.s };
const RATIO: Record<Frame["shape"], number> = { tall: 0.8, square: 1, wide: 1.5 };

export default function PhotoStrip({ frames, labels, hints }: Props) {
  const section = useRef<HTMLElement | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const hasReal = frames.some((f) => f.real);
  const total = frames.length;

  const setProgress = (p: number) => {
    if (fill.current) fill.current.style.width = `${p * 100}%`;
    if (count.current) count.current.textContent = `${pad(Math.min(total, 1 + Math.floor(p * total)))} / ${pad(total)}`;
  };

  /* Large screens: the section pins and the strip scrubs sideways as you scroll. Small screens (and reduced motion):
     a native swipeable row. The pinned layout is applied by script, so without it the row simply scrolls. */
  useEffect(() => {
    const sec = track.current?.closest("section") as HTMLElement | null;
    section.current = sec;
    const tr = track.current;
    if (!sec || !tr) return;
    const m = initMotion();
    setProgress(0);
    if (hint.current) hint.current.textContent = !hasReal ? hints.empty : hints.swipe;

    const onScroll = () => setProgress(tr.scrollLeft / (tr.scrollWidth - tr.clientWidth || 1));
    tr.addEventListener("scroll", onScroll, { passive: true });

    let alive = true;
    let teardown: (() => void) | undefined;
    let cancel = () => {};
    if (m.G) {
      cancel = afterPaint(() => {
        loadGsap().then(({ gsap }) => {
          if (!alive) return;
          const mm = gsap.matchMedia();
          mm.add("(min-width: 861px)", () => {
            // a few photos fit on screen already: nothing to scroll sideways, so don't pin (it would only trap the scroll)
            if (tr.scrollWidth - innerWidth < 8) return;
            sec.setAttribute("data-pinned", "");
            tr.removeEventListener("scroll", onScroll);
            if (hint.current) hint.current.textContent = !hasReal ? hints.empty : hints.scroll;
            const dist = () => Math.max(0, tr.scrollWidth - innerWidth);
            const tw = gsap.to(tr, {
              x: () => -dist(),
              ease: "none",
              scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${Math.max(1, dist())}`, pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => setProgress(s.progress) },
            });
            tr.querySelectorAll("[data-im]").forEach((im) =>
              gsap.fromTo(im, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: im.parentElement, containerAnimation: tw, start: "left right", end: "right left", scrub: true } }),
            );
            return () => {
              sec.removeAttribute("data-pinned");
              gsap.set(tr, { x: 0 });
              tr.addEventListener("scroll", onScroll, { passive: true });
            };
          });
          mm.add("(max-width: 860px)", () => {
            if (hint.current) hint.current.textContent = !hasReal ? hints.empty : hints.swipe;
          });
          teardown = () => mm.revert();
        });
      });
    }
    return () => {
      alive = false;
      cancel();
      teardown?.();
      tr.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReal, total]);

  return (
    <>
      <div ref={track} className={styles.track} role="group" aria-label={hints.scroll}>
        {frames.map((f, i) => {
          const cls = `${styles.frame} ${SHAPE[f.shape]} ${i % 2 === 0 ? styles.up : styles.dn}`;
          const inner = (
            <>
              <span className={styles.im} data-im style={f.real ? undefined : { background: f.gradient }}>
                {f.real && f.url ? (
                  <Image
                    src={f.url}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 860px) 70vw, 30vw"
                    style={f.hotspot ? { objectPosition: `${f.hotspot.x * 100}% ${f.hotspot.y * 100}%` } : undefined}
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                ) : null}
              </span>
              {f.real ? (
                <span className={styles.cap}>
                  <span>{pad(i + 1, 3)}</span>
                  <span>{f.caption}</span>
                </span>
              ) : null}
            </>
          );
          return f.real ? (
            <button key={f.id} type="button" className={cls} data-cursor={labels.view} aria-label={`${labels.view}: ${f.alt || f.caption}`} onClick={() => setOpen(i)}>
              {inner}
            </button>
          ) : (
            <div key={f.id} className={`${cls} ${styles.static}`} aria-hidden="true">{inner}</div>
          );
        })}
      </div>
      <div className={`${styles.pbar} pad`}>
        <span className="mono" ref={count}>{`${pad(1)} / ${pad(total)}`}</span>
        <span className={styles.bar}><i ref={fill} /></span>
        <span className="mono" ref={hint}>{hasReal ? hints.scroll : hints.empty}</span>
      </div>
      {open !== null ? <Lightbox frames={frames.filter((f) => f.real)} start={frames.filter((f) => f.real).findIndex((f) => f.id === frames[open].id)} labels={labels} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function Lightbox({ frames, start, labels, onClose }: { frames: Frame[]; start: number; labels: Props["labels"]; onClose: () => void }) {
  const [i, setI] = useState(Math.max(0, start));
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const f = frames[i];
  const go = (d: number) => setI((n) => (n + d + frames.length) % frames.length);
  const ratio = f.width && f.height ? f.width / f.height : RATIO[f.shape];

  useEffect(() => {
    const el = root.current!;
    opener.current = document.activeElement;
    lockScroll();
    el.querySelector<HTMLElement>("button")?.focus();
    let alive = true;
    if (initMotion().G) {
      loadGsap().then(({ gsap }) => {
        if (alive) gsap.fromTo(el, { clipPath: "inset(50% 50% 50% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" });
      });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const b = [...el.querySelectorAll<HTMLElement>("button")];
        if (e.shiftKey && document.activeElement === b[0]) { e.preventDefault(); b[b.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === b[b.length - 1]) { e.preventDefault(); b[0].focus(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => {
      alive = false;
      removeEventListener("keydown", onKey);
      unlockScroll();
      (opener.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={root} className={styles.box} role="dialog" aria-modal="true" aria-label={f.alt || f.caption} data-lenis-prevent>
      <div className={styles.boxBar}>
        <span className="mono">{`${pad(i + 1, 3)} / ${pad(frames.length, 3)}`}</span>
        <button type="button" onClick={onClose}><Roll text={`(${labels.close})`} /></button>
      </div>
      <div className={styles.boxStage}>
        <div className={styles.boxImg} style={{ "--ar": ratio } as React.CSSProperties}>
          {f.url ? <Image key={f.id} src={f.url} alt={f.alt} fill sizes="100vw" priority /> : null}
        </div>
      </div>
      <div className={styles.boxBar}>
        <button type="button" aria-label={labels.prev} onClick={() => go(-1)}><Roll text={`(${labels.prev})`} /></button>
        <span className={`mono ${styles.exif}`}>{f.exif}</span>
        <button type="button" aria-label={labels.next} onClick={() => go(1)}><Roll text={`(${labels.next})`} /></button>
      </div>
    </div>
  );
}
