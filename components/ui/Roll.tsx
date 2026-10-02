import type { CSSProperties } from "react";
import styles from "./Roll.module.css";

/** Per-letter roll on hover of the nearest link or button. */
export default function Roll({ text }: { text: string }) {
  return (
    <span className={styles.roll}>
      <span className={styles.sr}>{text}</span>
      {[...text].map((c, i) => (
        <span key={i} className={styles.ch} aria-hidden="true" style={{ "--i": i } as CSSProperties}>
          {c}
        </span>
      ))}
    </span>
  );
}
