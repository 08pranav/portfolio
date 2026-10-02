"use client";

import { useEffect, useRef } from "react";
import WithTime from "@/components/ui/WithTime";
import CoverLines from "./CoverLines";
import Portrait from "./Portrait";
import { fitWidth } from "@/lib/fit";
import { afterPaint, initMotion, loadGsap } from "@/lib/motion";
import type { Hero as HeroContent, SectionTarget, SiteSettings } from "@/sanity/lib/types";
import styles from "./Hero.module.css";

type Props = {
  hero: HeroContent;
  /** Your full name: the h1 search engines read. The big masthead beside it is decoration. */
  fullName: string;
  status: SiteSettings["status"];
  visibleTargets: SectionTarget[];
  /** Server-rendered intro sentence (italic marks already applied). */
  intro: React.ReactNode;
};

/** Width of "PRANAV." in ems at the masthead's font settings. Lets CSS size the masthead before any script runs. */
const MASTHEAD_EM = 3.1508;

export default function Hero({ hero, fullName, status, visibleTargets, intro }: Props) {
  const first = hero.portraits[0];
  const ratio = first?.width && first?.height ? first.width / first.height : 1536 / 994;
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wm = useRef<HTMLDivElement>(null);
  const ln = useRef<HTMLSpanElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const mastheadEm = hero.masthead.toUpperCase() === "PRANAV." ? MASTHEAD_EM : (hero.masthead.length * 0.4479) / 0.995;

  /* masthead fitted to the page width, portrait sized so the head overlaps the lower half of it */
  useEffect(() => {
    const layout = () => {
      const w = wm.current!, p = portrait.current!, s = stage.current!;
      fitWidth(w, ln.current!, w, "--wmfs");
      if (innerWidth > 860) {
        // The cover columns sit at the bottom corners. If the window is short for its width, the fitted masthead is
        // tall enough to run into them, so let the stage grow until the columns clear the letters.
        s.style.minHeight = "";
        const lettersBottom = w.offsetTop + ln.current!.offsetTop + ln.current!.offsetHeight;
        const covers = s.querySelector<HTMLElement>("[data-covers]");
        const colHeight = Math.max(0, ...[...(covers?.children ?? [])].map((c) => (c as HTMLElement).offsetHeight));
        const bottomPad = covers ? parseFloat(getComputedStyle(covers).paddingBottom) : 0;
        s.style.minHeight = `${Math.ceil(lettersBottom + 16 + colHeight + bottomPad)}px`;

        const capH = w.getBoundingClientRect().height;
        let ph = s.clientHeight - (w.offsetTop + capH * 0.46);
        ph = Math.min(ph, innerWidth / Number(p.dataset.ratio || 1.5453));
        p.style.setProperty("--ph", `${Math.max(240, ph)}px`);
      } else {
        s.style.minHeight = "";
        p.style.removeProperty("--ph");
      }
    };
    layout();
    addEventListener("resize", layout);
    document.fonts?.ready.then(layout);
    // edited cover text (live in the admin) changes the column heights, so fit again
    const observer = new ResizeObserver(layout);
    stage.current!.querySelectorAll("[data-covers] > *").forEach((col) => observer.observe(col));
    return () => {
      removeEventListener("resize", layout);
      observer.disconnect();
    };
  }, []);

  /* on scroll the portrait sinks and the name drifts up and dims; the portrait tilts toward the pointer.
     Pure polish, so it waits until after first paint. */
  useEffect(() => {
    const m = initMotion();
    if (!m.G) return;
    const h = root.current!;
    let alive = true;
    let teardown: (() => void) | undefined;

    const cancel = afterPaint(() => {
      loadGsap().then(({ gsap, ScrollTrigger }) => {
        if (!alive) return;
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
        teardown = () => {
          off?.();
          removeEventListener("load", refresh);
          ctx.revert();
        };
      });
    });

    return () => {
      alive = false;
      cancel();
      teardown?.();
    };
  }, []);

  return (
    <section ref={root} className={styles.hero} id="hero" aria-labelledby="hero-title">
      <div className={`${styles.issue} mono`} data-intro>
        <span>{hero.issue.left}</span>
        <span>{hero.issue.center}</span>
        <span><WithTime text={hero.issue.right} /></span>
      </div>
      <div ref={stage} className={styles.stage}>
        {/* The h1 is your full name, for search engines and screen readers. The giant letters are decoration. */}
        <h1 id="hero-title" className="sr">{fullName}</h1>
        <div ref={wm} className={styles.wm} style={{ "--wmk": mastheadEm } as React.CSSProperties} aria-hidden="true">
          <span ref={ln} className={styles.ln}>
            {[...hero.masthead].map((c, i) => (
              <span key={i} className={styles.l} data-intro-letter>{c}</span>
            ))}
          </span>
        </div>
        <Portrait ref={portrait} portraits={hero.portraits} ratio={ratio} />
        <CoverLines lines={hero.coverLines} currentlyLines={hero.currentlyLines} status={status} visibleTargets={visibleTargets} />
      </div>
      <div className={styles.foot} data-intro>
        <p>{intro}</p>
        <span className={`${styles.scrollhint} mono`}>{hero.scrollHint} <i /></span>
      </div>
    </section>
  );
}
