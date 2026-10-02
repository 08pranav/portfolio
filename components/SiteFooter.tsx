import Roll from "@/components/ui/Roll";
import ScrollLink from "@/components/ui/ScrollLink";
import type { ContactSection } from "@/sanity/lib/types";
import styles from "./SiteFooter.module.css";

/** The page footer landmark: copyright line and a way back to the top. */
export default function SiteFooter({ contact }: { contact: ContactSection }) {
  return (
    <footer className={`${styles.footer} pad`}>
      <span className="mono">{contact.footer.copyright}</span>
      <ScrollLink href="#top" className="mono"><Roll text={`(${contact.footer.backToTopLabel})`} /></ScrollLink>
    </footer>
  );
}
