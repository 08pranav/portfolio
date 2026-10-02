"use client";

import { useEffect, useRef } from "react";
import Roll from "@/components/ui/Roll";
import { afterPaint, initMotion, loadGsap } from "@/lib/motion";
import styles from "./About.module.css";

/** A real download link that leans toward the pointer (mouse only). */
export default function ResumeButton({ label, meta }: { label: string; meta: string }) {
  const el = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const m = initMotion();
    const a = el.current;
    if (!a || !m.G || !m.fine) return;
    let alive = true;
    let off: (() => void) | undefined;
    const cancel = afterPaint(() => {
      loadGsap().then(({ gsap }) => {
        if (!alive) return;
        const qx = gsap.quickTo(a, "x", { duration: 0.5, ease: "power3" });
        const qy = gsap.quickTo(a, "y", { duration: 0.5, ease: "power3" });
        const move = (e: MouseEvent) => {
          const r = a.getBoundingClientRect();
          qx((e.clientX - r.left - r.width / 2) * 0.25);
          qy((e.clientY - r.top - r.height / 2) * 0.35);
        };
        const leave = () => {
          qx(0);
          qy(0);
        };
        a.addEventListener("mousemove", move);
        a.addEventListener("mouseleave", leave);
        off = () => {
          a.removeEventListener("mousemove", move);
          a.removeEventListener("mouseleave", leave);
        };
      });
    });
    return () => {
      alive = false;
      cancel();
      off?.();
    };
  }, []);

  return (
    <a ref={el} className={styles.resume} href="/resume.pdf" download>
      <Roll text={label} />
      <span className="mono">{meta}</span>
    </a>
  );
}
