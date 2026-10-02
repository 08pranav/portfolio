"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Roll from "@/components/ui/Roll";
import ScrollLink from "@/components/ui/ScrollLink";
import WithTime from "@/components/ui/WithTime";
import ThemeToggle from "./ThemeToggle";
import { initMotion, lockScroll, unlockScroll } from "@/lib/motion";
import { jump } from "@/lib/scroll";
import type { Navigation, SiteSettings } from "@/sanity/lib/types";
import styles from "./Nav.module.css";

const two = (n: number) => String(n).padStart(2, "0");

type Props = {
  navigation: Navigation;
  logoText: string;
  status: SiteSettings["status"];
};

export default function Nav({ navigation, logoText, status }: Props) {
  const nav = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const menuClose = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { links, labels } = navigation;

  /* hide on scroll down, return on scroll up, blurred background after the hero */
  useEffect(() => {
    const m = initMotion();
    const el = nav.current!;
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      el.classList.toggle(styles.solid, y > innerHeight * 0.75);
      if (y > lastY + 2 && y > 300 && !m.locks) el.classList.add(styles.hide);
      else if (y < lastY - 2 || y <= 300) el.classList.remove(styles.hide);
      lastY = y;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  function openMenu() {
    const m = initMotion();
    const el = menu.current!;
    el.hidden = false;
    lockScroll();
    setOpen(true);
    if (m.G) {
      gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll("[data-menu-word]"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.05, delay: 0.3 });
    }
    menuClose.current?.focus();
  }

  function closeMenu(after?: () => void) {
    const m = initMotion();
    const el = menu.current!;
    if (el.hidden) return;
    const done = () => {
      el.hidden = true;
      unlockScroll();
      setOpen(false);
      if (after) after();
      else menuBtn.current?.focus();
    };
    if (m.G) gsap.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.5, ease: "expo.inOut", onComplete: done });
    else done();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav ref={nav} className={styles.nav}>
        <ScrollLink href="#top" className={styles.logo} data-intro>{logoText}</ScrollLink>
        <div className={styles.links} data-intro>
          {links.map((l) => (
            <ScrollLink key={l.label + l.target} href={`#${l.target}`}><Roll text={`(${l.label})`} /></ScrollLink>
          ))}
        </div>
        <div className={styles.right} data-intro>
          {status.openToWork ? (
            <span className={styles.status}><span className={styles.dot} aria-hidden="true" />{status.shortText}</span>
          ) : null}
          <ThemeToggle className={styles.nbtn} toDark={labels.toDark} toLight={labels.toLight} />
          <button ref={menuBtn} className={`${styles.nbtn} ${styles.menuBtn}`} type="button" aria-expanded={open} aria-controls="menu" onClick={openMenu}>
            <Roll text={`(${labels.menu})`} />
          </button>
        </div>
      </nav>

      <div ref={menu} id="menu" className={styles.menu} hidden data-lenis-prevent role="dialog" aria-modal="true" aria-label={labels.menu}>
        <div className={styles.menuTop}>
          <span className={styles.logo}>{logoText}</span>
          <button ref={menuClose} type="button" className={styles.nbtn} onClick={() => closeMenu()}><Roll text={`(${labels.close})`} /></button>
        </div>
        <div className={styles.menuLinks}>
          {links.map((l, i) => (
            <a
              key={l.label + l.target}
              href={`#${l.target}`}
              onClick={(e) => {
                e.preventDefault();
                closeMenu(() => setTimeout(() => jump(`#${l.target}`), 20));
              }}
            >
              <span className="mono" data-menu-word>{two(i + 1)}</span>
              <span className="it" data-menu-word>{l.label}</span>
            </a>
          ))}
        </div>
        <div className={`mono ${styles.menuFoot}`}>
          <span>{navigation.menuFooterLeft}</span>
          <span><WithTime text={navigation.menuFooterRight} /></span>
        </div>
      </div>
    </>
  );
}
