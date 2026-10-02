import Roll from "@/components/ui/Roll";
import ScrollLink from "@/components/ui/ScrollLink";
import Signature from "./Signature";
import type { ContactSection } from "@/sanity/lib/types";
import styles from "./SiteFooter.module.css";

/** The page footer: the giant name sitting on a rule, the copyright line and a way back to the top. */
export default function SiteFooter({ contact }: { contact: ContactSection }) {
  return (
    <footer className={styles.footer}>
      {contact.footer.signature ? <Signature text={contact.footer.signature} /> : null}
      <div className={styles.bar}>
        <span className="mono">{contact.footer.copyright}</span>
        <ScrollLink href="#top" className="mono"><Roll text={`(${contact.footer.backToTopLabel})`} /></ScrollLink>
      </div>
    </footer>
  );
}
