"use client";

import { useRef, useState } from "react";
import Roll from "@/components/ui/Roll";
import styles from "./Contact.module.css";

type Props = { email: string; labels: { copy: string; copied: string; copyFallback: string } };

/** The address as a mailto link, with a button that copies it (and selects it if the browser blocks copying). */
export default function CopyEmail({ email, labels }: Props) {
  const addr = useRef<HTMLAnchorElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "fallback">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      const sel = getSelection();
      const range = document.createRange();
      if (addr.current && sel) {
        range.selectNodeContents(addr.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      setState("fallback");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }

  const text = state === "copied" ? labels.copied : state === "fallback" ? labels.copyFallback : labels.copy;
  return (
    <>
      <a ref={addr} className={styles.addr} href={`mailto:${email}`}>{email}</a>
      <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
        <Roll text={`(${text})`} />
      </button>
    </>
  );
}
