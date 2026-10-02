"use client";

import { useEffect, useRef } from "react";
import { loadGsap, lockScroll, unlockScroll } from "@/lib/motion";
import styles from "./Loader.module.css";

const two = (n: number) => String(n).padStart(2, "0");

/**
 * The opening count: 00 to 99, slides up, then the masthead letters rise. Well under a second, and only played when
 * the head script decided so (html.show-loader), so crawlers, audits, reduced motion and repeat visits never see it.
 * Choreographs elements other components mark with data-intro (nav, issue strip, cover lines, hero foot),
 * data-intro-letter (masthead letters) and data-intro-tilt (portrait wrapper); their hidden start state is plain CSS
 * under html.show-loader, so nothing is hidden unless the loader is actually going to play.
 */
export default function Loader({ caption }: { caption: string }) {
  const loader = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = loader.current;
    const countEl = count.current;
    if (!el || !countEl || !root.classList.contains("show-loader")) return;

    let alive = true;
    let locked = false;
    let kill: (() => void) | undefined;
    const finish = () => {
      root.classList.remove("show-loader");
      if (locked) {
        locked = false;
        unlockScroll();
      }
    };
    lockScroll();
    locked = true;
    // never leave the page covered if the animation code is slow or fails to load
    const safety = setTimeout(() => alive && finish(), 2500);

    loadGsap()
      .then(({ gsap }) => {
        if (!alive) return;
        const letters = gsap.utils.toArray<HTMLElement>("[data-intro-letter]");
        const fades = gsap.utils.toArray<HTMLElement>("[data-intro]");
        const tilt = "[data-intro-tilt]";
        // Hand the start positions from CSS to GSAP in one synchronous step (so nothing paints in between). The class
        // must go first: if GSAP read the CSS transform it would add it to its own and the letters would never land.
        el.style.display = "flex";
        root.classList.remove("show-loader");
        gsap.set(letters, { yPercent: 115 });
        gsap.set(tilt, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(fades, { y: 18, opacity: 0 });
        gsap.set(el, { yPercent: 0 });
        countEl.textContent = "00";

        const n = { v: 0 };
        const intro = gsap.timeline({
          onComplete: () => {
            el.style.display = "none";
            clearTimeout(safety);
            finish();
          },
        });
        intro
          .to(n, { v: 100, duration: 0.4, ease: "power2.inOut", onUpdate: () => { countEl.textContent = two(Math.min(99, Math.round(n.v))); } })
          .to(el, { yPercent: -100, duration: 0.35, ease: "expo.inOut" })
          .to(letters, { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.04 }, "-=.25")
          .to(tilt, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.inOut" }, "<.05")
          .to(fades, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.03 }, "<.2");
        kill = () => intro.kill();
      })
      .catch(finish);

    return () => {
      alive = false;
      clearTimeout(safety);
      kill?.();
      if (locked) {
        locked = false;
        unlockScroll();
      }
    };
  }, []);

  return (
    <div ref={loader} className={styles.loader} aria-hidden="true">
      <span ref={count} className={styles.count}>00</span>
      <span className="mono">{caption}</span>
    </div>
  );
}
