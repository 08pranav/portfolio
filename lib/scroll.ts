import { initMotion, loadGsap } from "./motion";

export function targetY(target: string) {
  if (target === "#top") return 0;
  const el = document.querySelector(target);
  return el ? el.getBoundingClientRect().top + scrollY : null;
}

/** Jump instantly (used after the mobile menu closes). */
export function jump(target: string) {
  const y = targetY(target);
  if (y === null) return;
  const { lenis } = initMotion();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else scrollTo(0, y);
}

/** Short hops glide; long jumps fade through a quick veil so pinned sections don't scrub past. */
export async function go(target: string) {
  const y = targetY(target);
  if (y === null) return;
  const m = initMotion();
  const far = Math.abs(y - scrollY) > innerHeight * 1.4;
  if (!m.G) {
    scrollTo({ top: y, behavior: m.reduced ? "auto" : "smooth" });
    return;
  }
  if (!far) {
    if (m.lenis) m.lenis.scrollTo(y, { duration: 1.1, force: true });
    else scrollTo({ top: y, behavior: "smooth" });
    return;
  }
  const { gsap, ScrollTrigger } = await loadGsap();
  const veil = document.getElementById("veil");
  gsap
    .timeline()
    .to(veil, { opacity: 1, duration: 0.28, ease: "power2.in" })
    .add(() => {
      if (m.lenis) m.lenis.scrollTo(y, { immediate: true, force: true });
      else scrollTo(0, y);
      ScrollTrigger.update();
    })
    .to(veil, { opacity: 0, duration: 0.45, ease: "power2.out", delay: 0.08 });
}

/** Mumbai wall-clock "HH:MM" used by the Clock component. */
export function formatClock(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date());
}
