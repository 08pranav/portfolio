import { Fragment } from "react";
import SectionHead from "@/components/ui/SectionHead";
import { monthYear } from "@/lib/format";
import Lede from "./Lede";
import ResumeButton from "./ResumeButton";
import type { AboutSection as AboutContent, RichText, SiteSettings } from "@/sanity/lib/types";
import styles from "./About.module.css";

/** The lede's words as spans (italic marks kept), so the scroll effect has something to fill in. */
function ledeWords(value: RichText) {
  return value.flatMap((block, b) =>
    ((block as { children?: { text?: string; marks?: string[] }[] }).children ?? []).map((child, c) => {
      const italic = child.marks?.includes("em");
      return (
        <Fragment key={`${b}-${c}`}>
          {(child.text ?? "").split(/(\s+)/).map((part, i) =>
            !part ? null : /^\s+$/.test(part) ? part : (
              <span key={i} className={italic ? "wd it" : "wd"}>{part}</span>
            ),
          )}
        </Fragment>
      );
    }),
  );
}

/** Who I am: the lede, the four facts, experience and education, and the résumé. */
export default function AboutSection({ about, resume }: { about: AboutContent; resume: SiteSettings["resume"] }) {
  const meta = ["PDF", resume.pages ? `${resume.pages} ${resume.pages === 1 ? "page" : "pages"}` : "", monthYear(resume.updatedAt)].filter(Boolean).join(" · ");
  return (
    <section id="about" className="sect pad" aria-labelledby="about-title">
      <SectionHead id="about-title" index={about.indexLabel} parts={[{ text: about.titleCaps, kind: "g" }, { text: about.titleItalic, kind: "it" }]} side={about.sideLabel} />
      <Lede>{ledeWords(about.lede)}</Lede>

      {about.facts.length ? (
        <ul className={styles.facts}>
          {about.facts.map((f) => (
            <li key={f.label}><span className="mono">{f.label}</span><span>{f.value}</span></li>
          ))}
        </ul>
      ) : null}

      {about.experience.length || about.education.length || about.certifications.length ? (
        <div className={styles.cv}>
          {about.experience.length ? (
            <section aria-labelledby="exp-title">
              <h3 id="exp-title" className={`mono ${styles.cvHead}`}>{about.experienceLabel}</h3>
              <ul className={styles.rows}>
                {about.experience.map((e) => (
                  <li key={e.when + e.role} className={styles.row}>
                    <span className={`mono ${styles.when}`}>{e.when}</span>
                    <div className={styles.what}>
                      <h4 className={styles.role}>{e.role}</h4>
                      <span className={styles.org}>{e.org}</span>
                      {e.text ? <p className={styles.text}>{e.text}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {about.education.length ? (
            <section aria-labelledby="edu-title">
              <h3 id="edu-title" className={`mono ${styles.cvHead}`}>{about.educationLabel}</h3>
              <ul className={styles.rows}>
                {about.education.map((e) => (
                  <li key={e.when + e.title} className={styles.row}>
                    <span className={`mono ${styles.when}`}>{e.when}</span>
                    <div className={styles.what}>
                      <h4 className={styles.role}>{e.title}</h4>
                      <span className={styles.org}>{e.org}</span>
                      {e.note ? <p className={styles.text}>{e.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {about.certifications.length ? (
            <section className={styles.wide} aria-labelledby="cert-title">
              <h3 id="cert-title" className={`mono ${styles.cvHead}`}>{about.certificationsLabel}</h3>
              <ul className={styles.certs}>
                {about.certifications.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {resume.url ? <ResumeButton label={about.resumeLabel} meta={meta} /> : null}
    </section>
  );
}
