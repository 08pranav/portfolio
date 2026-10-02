"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { initMotion } from "@/lib/motion";
import styles from "./Loader.module.css";

const two = (n: number) => String(n).padStart(2, "0");

/**
 * Counts 00 to 99, slides up, then the masthead letters rise.
 * Choreographs the elements other components mark with data-intro (nav, issue strip, cover lines, hero foot),
 * data-intro-letter (masthead letters) and data-intro-tilt (portrait wrapper).
 */
export default function Loader({ caption }: { caption: string }) {
  const loader = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const m = initMotion();
    const el = loader.current;
    const countEl = count.current;
    if (!el || !countEl) return;
    if (!m.G) {
      el.style.display = "none";
      return;
    }

    const letters = gsap.utils.toArray<HTMLElement>("[data-intro-letter]");
    const fades = gsap.utils.toArray<HTMLElement>("[data-intro]");
    const tilt = "[data-intro-tilt]";

    gsap.set(letters, { yPercent: 115 });
    gsap.set(tilt, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(fades, { y: 18, opacity: 0 });
    gsap.set(el, { yPercent: 0 });
    el.style.display = "";
    countEl.textContent = "00";
    m.lenis?.stop();

    const n = { v: 0 };
    const intro = gsap.timeline({
      onComplete: () => {
        m.lenis?.start();
        el.style.display = "none";
      },
    });
    intro
      .to(n, {
        v: 100,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          countEl.textContent = two(Math.min(99, Math.round(n.v)));
        },
      })
      .to(el, { yPercent: -100, duration: 0.85, ease: "expo.inOut" })
      .to(letters, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 }, "-=.35")
      .to(tilt, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut" }, "<.05")
      .to(fades, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }, "<.5");

    // never let a stalled tab leave the loader up
    const safety = setTimeout(() => {
      if (el.style.display !== "none") intro.progress(1);
    }, 6000);

    return () => {
      clearTimeout(safety);
      intro.kill();
      gsap.set([letters, fades, tilt], { clearProps: "all" });
      m.lenis?.start();
    };
  }, []);

  return (
    <div ref={loader} className={styles.loader} aria-hidden="true">
      <span ref={count} className={styles.count}>00</span>
      <span className="mono">{caption}</span>
    </div>
  );
}
