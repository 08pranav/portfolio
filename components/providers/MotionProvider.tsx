"use client";

import { useEffect } from "react";
import { afterPaint, initMotion, startSmoothScroll } from "@/lib/motion";

/** Starts smooth scrolling after first paint and drives --v (headlines widen when you scroll fast). */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const m = initMotion();
    let raf = 0;
    let v = 0;
    let alive = true;
    const cancel = afterPaint(() => {
      startSmoothScroll().then(() => {
        if (!alive || !m.lenis) return;
        const loop = () => {
          const t = m.lenis ? Math.min(1, Math.abs(m.lenis.velocity) / 35) : 0;
          v += (t - v) * 0.08;
          document.documentElement.style.setProperty("--v", v.toFixed(3));
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      });
    });
    return () => {
      alive = false;
      cancel();
      cancelAnimationFrame(raf);
      m.destroy();
    };
  }, []);

  return <>{children}</>;
}
