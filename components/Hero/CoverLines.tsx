"use client";

import { useEffect, useState } from "react";
import Roll from "@/components/ui/Roll";
import ScrollLink from "@/components/ui/ScrollLink";
import { initMotion } from "@/lib/motion";
import type { CoverLine, SectionTarget, SiteSettings } from "@/sanity/lib/types";
import styles from "./Hero.module.css";

type Props = {
  lines: CoverLine[];
  currentlyLines: string[];
  status: SiteSettings["status"];
  /** Sections currently on the page; a link to a hidden section is dropped. */
  visibleTargets: SectionTarget[];
};

/** The cover lines. Any line set to "Currently" rotates quietly. */
export default function CoverLines({ lines, currentlyLines, status, visibleTargets }: Props) {
  const [i, setI] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (initMotion().reduced || currentlyLines.length < 2) return;
    let swap: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setOut(true);
      swap = setTimeout(() => {
        setI((n) => (n + 1) % currentlyLines.length);
        setOut(false);
      }, 450);
    }, 4200);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
  }, [currentlyLines.length]);

  const split = Math.ceil(lines.length / 2);
  const columns = [lines.slice(0, split), lines.slice(split)];

  return (
    <div className={styles.covers}>
      {columns.map((col, c) => (
        <div className={styles.col} key={c}>
          {col.map((line) => (
            <div className={styles.cover} key={line.label} data-intro>
              <span className="mono">{line.label}</span>
              {line.bigNumber ? <span className={styles.num}>{line.bigNumber}</span> : null}
              <p>
                {line.textSource === "custom" ? (
                  line.text
                ) : line.textSource === "status" ? (
                  <>
                    {status.openToWork ? <span className={styles.live} aria-hidden="true" /> : null}
                    {status.text}
                  </>
                ) : (
                  <span className={`${styles.rot} ${out ? styles.out : ""}`}>{currentlyLines[i % Math.max(1, currentlyLines.length)]}</span>
                )}
              </p>
              {visibleTargets.includes(line.linkTarget) ? (
                <ScrollLink href={`#${line.linkTarget}`}><Roll text={line.linkLabel} /></ScrollLink>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
