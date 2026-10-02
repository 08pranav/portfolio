"use client";

import { useEffect, useRef } from "react";
import { afterPaint, initMotion, loadGsap } from "@/lib/motion";
import styles from "./About.module.css";

/**
 * The big paragraph. Its words are already in the HTML (children); on scroll they fill in from faint to full.
 * If the animation code is slow or fails, they are simply shown in full.
 */
export default function Lede({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !initMotion().G) return;
    let alive = true;
    let kill: (() => void) | undefined;
    const showAll = () => el.setAttribute("data-lede-static", "");
    const timeout = setTimeout(showAll, 8000);

    const cancel = afterPaint(() => {
      loadGsap()
        .then(({ gsap }) => {
          if (!alive) return;
          clearTimeout(timeout);
          const words = el.querySelectorAll(".wd");
          const tween = gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } });
          kill = () => {
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        })
        .catch(showAll);
    });
    return () => {
      alive = false;
      clearTimeout(timeout);
      cancel();
      kill?.();
    };
  }, []);

  return (
    <p ref={root} className={styles.lede} data-lede>
      {children}
    </p>
  );
}
