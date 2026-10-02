"use client";

import { useEffect, useRef } from "react";
import styles from "./SiteFooter.module.css";

/** "Pranav." in the signature's face, from the font's metrics: whole box, ink only, left side bearing (all in em). */
const DEFAULT_WORD = { box: 2.582, ink: 2.496, lsb: 0.045 };

/** The giant name above the footer line, fitted to the full width, ink to ink. */
export default function Signature({ text }: { text: string }) {
  const m = text === "Pranav." ? DEFAULT_WORD : { box: text.length * 0.37, ink: text.length * 0.37, lsb: 0 };
  const wrap = useRef<HTMLDivElement>(null);
  const sig = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const w = wrap.current!, s = sig.current!;
    const fit = () => {
      s.style.setProperty("--sigfs", "100px");
      const box = s.getBoundingClientRect().width;
      if (box > 0) s.style.setProperty("--sigfs", `${((100 * w.clientWidth * (m.box / m.ink)) / box) * 1.0}px`);
    };
    fit();
    addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
    return () => removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div ref={wrap} className={styles.sigwrap} aria-hidden="true" data-reveal-up>
      <span ref={sig} className={styles.sig} data-sig style={{ "--sigk": m.ink, "--siglsb": m.lsb } as React.CSSProperties}>{text}</span>
    </div>
  );
}
