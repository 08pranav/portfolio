"use client";

import { useEffect } from "react";
import { initMotion } from "@/lib/motion";

/** Registers GSAP plugins and Lenis once, and drives --v (headlines widen when you scroll fast). */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const m = initMotion();
    let raf = 0;
    let v = 0;
    if (!m.reduced) {
      const loop = () => {
        const t = m.lenis ? Math.min(1, Math.abs(m.lenis.velocity) / 35) : 0;
        v += (t - v) * 0.08;
        document.documentElement.style.setProperty("--v", v.toFixed(3));
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      m.destroy();
    };
  }, []);

  return <>{children}</>;
}
