import NoteForm from "./NoteForm";
import CopyEmail from "./CopyEmail";
import SectionHead from "@/components/ui/SectionHead";
import { Icon } from "@/components/ui/Icons";
import WithTime from "@/components/ui/WithTime";
import type { ContactSection as ContactContent, SiteSettings } from "@/sanity/lib/types";
import styles from "./Contact.module.css";

/** Got an idea? Say hi: my email, my profiles, and a note form. */
export default function ContactSection({ contact, site }: { contact: ContactContent; site: SiteSettings }) {
  const { labels } = contact;
  return (
    <section id="contact" className={`${styles.contact} pad`} aria-labelledby="contact-title">
      <SectionHead id="contact-title" index={contact.indexLabel} lines parts={[{ text: contact.headingCaps, kind: "g" }, { text: contact.headingItalic, kind: "it" }]} />
      <div className={styles.grid}>
        <div className={styles.left}>
          <div className={styles.mailbox}>
            <span className="mono">{labels.email}</span>
            <CopyEmail email={site.email} labels={labels} />
          </div>
          {site.socials.length ? (
            <div className={styles.mailbox}>
              <span className="mono">{labels.elsewhere}</span>
              <ul className={styles.socials}>
                {site.socials.map((s) => (
                  <li key={s.platform + s.url}>
                    <a className={styles.so} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label || s.platform} title={s.label || s.platform}>
                      <Icon name={s.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={`${styles.where} mono`}>
            <span>{labels.locationLine}</span>
            <span><WithTime text={labels.replyLine} /></span>
          </div>
        </div>
        <div>
          <NoteForm form={contact.form} email={site.email} />
        </div>
      </div>
    </section>
  );
}
