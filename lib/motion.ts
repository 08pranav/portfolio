import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export type Motion = {
  /** prefers-reduced-motion: no loader, no smooth scroll, no scrubbed animation. */
  reduced: boolean;
  /** Hover-capable fine pointer (mouse). */
  fine: boolean;
  /** GSAP choreography enabled (= !reduced). */
  G: boolean;
  lenis: Lenis | null;
  locks: number;
  destroy: () => void;
};

let state: Motion | null = null;

/** Idempotent. Registers GSAP plugins once and creates Lenis. Client only. */
export function initMotion(): Motion {
  if (state) return state;
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = !reduced;

  let lenis: Lenis | null = null;
  let tick: ((t: number) => void) | null = null;
  if (G) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    tick = (t) => lenis!.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  const m: Motion = {
    reduced,
    fine,
    G,
    lenis,
    locks: 0,
    destroy() {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      document.documentElement.style.overflow = "";
      state = null;
    },
  };
  state = m;
  return m;
}

/** Counted scroll lock for overlays. */
export function lockScroll() {
  const m = initMotion();
  if (m.locks++ === 0) {
    m.lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
}

export function unlockScroll() {
  const m = initMotion();
  if (m.locks > 0 && --m.locks === 0) {
    m.lenis?.start();
    document.documentElement.style.overflow = "";
  }
}
