"use client";

import { useEffect } from "react";

/** Marks [data-reveal] headings as seen when they scroll into view. Does nothing for crawlers or reduced motion. */
export default function RevealObserver() {
  useEffect(() => {
    if (!document.documentElement.classList.contains("anim")) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-reveal], [data-reveal-up]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
