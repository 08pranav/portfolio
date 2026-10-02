import type Lenis from "lenis";
import type gsapType from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export type Gsap = { gsap: typeof gsapType; ScrollTrigger: typeof ScrollTriggerType };

export type Motion = {
  /** prefers-reduced-motion: no loader, no smooth scroll, no scrubbed animation. */
  reduced: boolean;
  /** Hover-capable fine pointer (mouse). */
  fine: boolean;
  /** GSAP choreography enabled (= !reduced). */
  G: boolean;
  /** Set once Lenis has loaded (after first paint). */
  lenis: Lenis | null;
  locks: number;
  destroy: () => void;
  cleanup?: () => void;
};

let state: Motion | null = null;
let gsapPromise: Promise<Gsap> | null = null;

/** Idempotent and cheap: reads the visitor's preferences. Loads no animation code. Client only. */
export function initMotion(): Motion {
  if (state) return state;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const m: Motion = {
    reduced,
    fine,
    G: !reduced,
    lenis: null,
    locks: 0,
    destroy() {
      m.cleanup?.();
      document.documentElement.style.overflow = "";
      if (state === m) state = null;
    },
  };
  state = m;
  return m;
}

/** GSAP and ScrollTrigger, fetched on demand (never in the first bundle). */
export function loadGsap(): Promise<Gsap> {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return gsapPromise;
}

/** Runs `cb` once the browser is idle after the first paint. Returns a cancel function. */
export function afterPaint(cb: () => void): () => void {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(cb, { timeout: 1500 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}

/** Smooth scrolling with Lenis, started after first paint and never under reduced motion. */
export async function startSmoothScroll(): Promise<void> {
  const m = initMotion();
  if (!m.G || m.lenis) return;
  const [{ gsap, ScrollTrigger }, { default: LenisCtor }] = await Promise.all([loadGsap(), import("lenis")]);
  if (state !== m || m.lenis) return; // torn down, or started by someone else, while the chunks loaded
  const lenis = new LenisCtor({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  m.lenis = lenis;
  if (m.locks > 0) lenis.stop();
  m.cleanup = () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    m.lenis = null;
  };
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
