import styles from "./Veil.module.css";

/** Full-screen fade used for long nav jumps; driven by lib/scroll.ts. */
export default function Veil() {
  return <div id="veil" className={styles.veil} aria-hidden="true" />;
}
