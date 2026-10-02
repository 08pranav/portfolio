"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CoverLines from "./CoverLines";
import Portrait from "./Portrait";
import { fitWidth } from "@/lib/fit";
import { initMotion } from "@/lib/motion";
import RichText from "@/components/ui/RichText";
import WithTime from "@/components/ui/WithTime";
import type { Hero as HeroContent, SectionTarget, SiteSettings } from "@/sanity/lib/types";
import styles from "./Hero.module.css";

type Props = {
  hero: HeroContent;
  /** Full name, read out by screen readers for the masthead. */
  fullName: string;
  status: SiteSettings["status"];
  visibleTargets: SectionTarget[];
};

export default function Hero({ hero, fullName, status, visibleTargets }: Props) {
  const first = hero.portraits[0];
  const ratio = first?.width && first?.height ? first.width / first.height : 1536 / 994;
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wm = useRef<HTMLHeadingElement>(null);
  const ln = useRef<HTMLSpanElement>(null);
  const portrait = useRef<HTMLDivElement>(null);

  /* masthead fitted to the page width, portrait sized so the head overlaps the lower half of it */
  useEffect(() => {
    const layout = () => {
      const w = wm.current!, p = portrait.current!, s = stage.current!;
      fitWidth(w, ln.current!, w, "--wmfs");
      if (innerWidth > 860) {
        const capH = w.getBoundingClientRect().height;
        let ph = s.clientHeight - (w.offsetTop + capH * 0.46);
        ph = Math.min(ph, innerWidth / Number(p.dataset.ratio || 1.5453));
        p.style.setProperty("--ph", `${Math.max(240, ph)}px`);
      } else p.style.removeProperty("--ph");
    };
    layout();
    addEventListener("resize", layout);
    document.fonts?.ready.then(layout);
    return () => removeEventListener("resize", layout);
  }, []);

  /* on scroll the portrait sinks and the name drifts up and dims; the portrait tilts toward the pointer */
  useEffect(() => {
    const m = initMotion();
    if (!m.G) return;
    const h = root.current!;
    const trigger = { trigger: h, start: "top top", end: "bottom top", scrub: true };
    const ctx = gsap.context(() => {
      gsap.to(portrait.current, { yPercent: 10, ease: "none", scrollTrigger: trigger });
      gsap.to(wm.current, { yPercent: -18, opacity: 0.25, ease: "none", scrollTrigger: { ...trigger } });
    }, h);

    let off: (() => void) | undefined;
    if (m.fine) {
      const tilt = h.querySelector("[data-intro-tilt]");
      const rx = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3" });
      gsap.set(portrait.current, { perspective: 1400 });
      const move = (e: MouseEvent) => {
        rx((e.clientX / innerWidth - 0.5) * 4);
        ry(-(e.clientY / innerHeight - 0.5) * 2);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      h.addEventListener("mousemove", move);
      h.addEventListener("mouseleave", leave);
      off = () => {
        h.removeEventListener("mousemove", move);
        h.removeEventListener("mouseleave", leave);
      };
    }

    const refresh = () => ScrollTrigger.refresh();
    addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => {
      off?.();
      removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <header ref={root} className={styles.hero} id="hero">
      <div className={`${styles.issue} mono`} data-intro>
        <span>{hero.issue.left}</span>
        <span>{hero.issue.center}</span>
        <span><WithTime text={hero.issue.right} /></span>
      </div>
      <div ref={stage} className={styles.stage}>
        <h1 ref={wm} className={styles.wm} aria-label={fullName}>
          <span ref={ln} className={styles.ln}>
            {[...hero.masthead].map((c, i) => (
              <span key={i} className={styles.l} data-intro-letter aria-hidden="true">{c}</span>
            ))}
          </span>
        </h1>
        <Portrait ref={portrait} portraits={hero.portraits} ratio={ratio} />
        <CoverLines lines={hero.coverLines} currentlyLines={hero.currentlyLines} status={status} visibleTargets={visibleTargets} />
      </div>
      <div className={styles.foot} data-intro>
        <p><RichText value={hero.intro} /></p>
        <span className={`${styles.scrollhint} mono`}>{hero.scrollHint} <i /></span>
      </div>
    </header>
  );
}
