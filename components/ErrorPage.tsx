import Link from "next/link";
import styles from "./ErrorPage.module.css";

/** The page for missing addresses (404) and failures (500), in the masthead style of the site. */
export default function ErrorPage({
  code,
  title,
  body,
  homeLabel,
  action,
}: {
  code: string;
  title: string;
  body: string;
  homeLabel: string;
  /** e.g. a "Try again" button for the error page. */
  action?: React.ReactNode;
}) {
  return (
    <main id="top" className={styles.page}>
      <p className={styles.code} aria-hidden="true">{code}</p>
      <div className={styles.copy}>
        <h1 className={`it ${styles.title}`}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <Link href="/" className={styles.act}>{homeLabel}</Link>
        {action}
      </div>
    </main>
  );
}
