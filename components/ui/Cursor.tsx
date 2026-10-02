"use client";

import { useEffect, useRef } from "react";
import { initMotion } from "@/lib/motion";
import styles from "./Cursor.module.css";

/** Custom cursor: a dot that becomes a labelled disc over [data-cursor] and a dashed ring over [data-cursor-ring]. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const { fine, reduced } = initMotion();
    const c = ref.current;
    const cl = label.current;
    if (!c || !cl || !fine || reduced) return;

    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      c.classList.add(styles.on);
    };
    const onLeave = () => c.classList.remove(styles.on);
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const cur = t.closest<HTMLElement>("[data-cursor]");
      if (cur) {
        cl.textContent = cur.dataset.cursor ?? "";
        c.classList.add(styles.big);
      } else c.classList.remove(styles.big);
      const ring = t.closest<HTMLElement>("[data-cursor-ring]");
      c.classList.toggle(styles.ring, !!ring);
      if (ring) c.style.setProperty("--rs", `${ring.dataset.cursorRing || 56}px`);
    };
    const onSpin = () => {
      c.classList.remove(styles.spin);
      void c.offsetWidth;
      c.classList.add(styles.spin);
    };
    addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    addEventListener("cursor:spin", onSpin);

    let lt = 0, raf = 0;
    const loop = (t: number) => {
      const dt = Math.min(100, lt ? t - lt : 16.7);
      lt = t;
      const a = 1 - Math.pow(0.78, dt / 16.7);
      cx += (x - cx) * a;
      cy += (y - cy) * a;
      c.style.transform = `translate(${cx}px,${cy}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      removeEventListener("cursor:spin", onSpin);
    };
  }, []);

  return (
    <div ref={ref} className={styles.cursor} aria-hidden="true">
      <span ref={label} className={styles.label} />
    </div>
  );
}
