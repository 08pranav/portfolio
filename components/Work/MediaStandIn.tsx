"use client";

import { useState } from "react";
import type { MediaItem, Project } from "@/sanity/lib/types";
import styles from "./ProjectView.module.css";

type Props = { project: Project; item: MediaItem; /** Small preview inside a thumbnail: no controls. */ thumb?: boolean };

/** The generated stand-in for a media item that has no file yet. Purely decorative: the slide itself is labelled. */
export default function MediaStandIn({ project, item, thumb = false }: Props) {
  const [playing, setPlaying] = useState(false);
  const { background: bg, text: fg } = project.theme;
  const tint = { background: `color-mix(in srgb, ${bg} 22%, var(--card))` };
  const arch = project.archLabels ?? [];

  const page = (variant?: string) =>
    variant === "dash" ? (
      <div className={styles.row}>
        <div className={styles.side}><b /><b /><b /><b /></div>
        <div className={styles.lines} style={{ flex: 1 }}>
          <div className={styles.bars}>
            {[40, 65, 50, 85, 70, 95, 60].map((h, i) => <b key={i} style={{ height: `${h}%` }} />)}
          </div>
        </div>
      </div>
    ) : variant === "list" ? (
      <>
        <div className={styles.h}>{project.title}</div>
        <div className={styles.lines}><b /><b /><b /><b /><b /></div>
      </>
    ) : (
      <>
        <div className={styles.h}>{project.title}</div>
        <div className={styles.row}><span className={styles.blk} /><span className={`${styles.blk} ${styles.d}`} /><span className={styles.blk} /></div>
        <div className={styles.row}><span className={`${styles.blk} ${styles.d}`} /><span className={styles.blk} /><span className={`${styles.blk} ${styles.d}`} /></div>
      </>
    );

  const win = (variant?: string) => (
    <div className={styles.win} style={{ background: bg, color: fg }}>
      <div className={styles.chrome}><i /><i /><i /><span>{project.urlLabel}</span></div>
      <div className={styles.pg}>{page(variant)}</div>
    </div>
  );

  if (item.type === "mobile")
    return (
      <div className={styles.m} style={tint} aria-hidden="true">
        <div className={styles.phone} style={{ background: bg, color: fg }}>
          <div className={styles.h}>{project.title}</div>
          <div className={styles.lines}><b /><b /><b /><b /></div>
        </div>
      </div>
    );

  if (item.type === "videoFile" || item.type === "videoUrl")
    return (
      <div className={`${styles.m} ${playing ? styles.playing : ""}`} style={tint} onClick={() => playing && setPlaying(false)}>
        <div aria-hidden="true" style={{ display: "contents" }}>
          {win("home")}
          <span className={styles.ptr} />
          <span className={styles.tl}><b /></span>
          <span className={styles.dur}>{item.duration ?? "0:30"}</span>
        </div>
        {thumb ? (
          <span className={styles.play}><i /></span>
        ) : (
          <button type="button" className={styles.play} aria-label={`${playing ? "Pause" : "Play"}: ${item.caption}`} onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }}>
            <i />
          </button>
        )}
      </div>
    );

  if (item.type === "diagram")
    return (
      <div className={styles.m} style={{ background: bg, color: fg }} aria-hidden="true">
        <div className={styles.arch}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: "contents" }}>
              {i > 0 ? <span className={styles.arrowMock}>→</span> : null}
              <div className={styles.node}>
                <span className="mono">{["client", "api", "data"][i]}</span>
                <strong>{arch[i] ?? ""}</strong>
              </div>
            </span>
          ))}
        </div>
      </div>
    );

  return <div className={styles.m} style={tint} aria-hidden="true">{win(item.mock)}</div>;
}
