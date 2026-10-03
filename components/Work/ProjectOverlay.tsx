"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProjectView from "./ProjectView";
import { useTabTitle } from "@/hooks/useTabTitle";
import { initMotion, loadGsap, lockScroll, overlayClose, overlayOpen, unlockScroll } from "@/lib/motion";

type ViewProps = Omit<React.ComponentProps<typeof ProjectView>, "mode" | "onClose" | "rootRef">;

/**
 * A project opened from the home page: the same content as /projects/<slug>, shown over the page.
 * Escape, the Close button and the browser Back button all return to the home page; focus goes back to the link
 * that opened it; the tab title follows the project and is restored on close.
 */
export default function ProjectOverlay(props: ViewProps) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const closing = useRef(false);
  useTabTitle(props.project.title);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const el = root.current;
    if (el && initMotion().G) {
      loadGsap().then(({ gsap }) => gsap.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: "expo.in", onComplete: () => router.back() }));
    } else router.back();
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    opener.current = document.activeElement;
    lockScroll();
    overlayOpen();
    el.querySelector<HTMLElement>("button, a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        // keep keyboard focus inside the dialog
        const f = [...el.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), video[controls]")].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      unlockScroll();
      overlayClose();
      (opener.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // opening animation: the page wipes up, then the content settles in
  useEffect(() => {
    const el = root.current;
    if (!el || !initMotion().G) return;
    let alive = true;
    loadGsap().then(({ gsap }) => {
      if (!alive) return;
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll("[class*=gal], [class*=cinfo] > *"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.3 });
    });
    return () => {
      alive = false;
    };
  }, [props.project.slug]);

  return <ProjectView {...props} mode="overlay" onClose={close} rootRef={root} />;
}
