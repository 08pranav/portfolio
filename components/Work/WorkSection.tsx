import Link from "next/link";
import SectionHead from "@/components/ui/SectionHead";
import type { WorkSection as WorkContent } from "@/sanity/lib/types";
import styles from "./Work.module.css";

const two = (n: number) => String(n).padStart(2, "0");

/** The project index. Every row is a real link to /projects/<slug>; on the home page it opens as an overlay. */
export default function WorkSection({ work }: { work: WorkContent }) {
  return (
    <section id="work" className="sect pad" aria-labelledby="work-title">
      <SectionHead
        id="work-title"
        index={work.indexLabel}
        parts={[{ text: work.titleCaps, kind: "g" }, { text: work.titleItalic, kind: "it" }]}
        sup={`(${two(work.projects.length)})`}
        side={work.subtitle}
      />
      <ol className={styles.list}>
        {work.projects.map((p) => (
          <li key={p._id} className={styles.row} data-cursor={work.labels.view}>
            <span className="mono">{p.year}</span>
            <h3 className={styles.name}>
              <Link href={`/projects/${p.slug}`} scroll={false} className={styles.link}>
                <span className={styles.clip}>
                  <span className={styles.rl}>
                    <span>{p.title}</span>
                    <span className="it" aria-hidden="true">{p.title}</span>
                  </span>
                </span>
              </Link>
            </h3>
            <span className={styles.meta}>
              <span className="mono">{p.stack.slice(0, 3).join(", ")}</span>
            </span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
