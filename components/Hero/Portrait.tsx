"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { initMotion } from "@/lib/motion";
import type { ImageRef } from "@/sanity/lib/types";
import styles from "./Hero.module.css";

/** Cutout portrait. Click (or Enter/Space) swaps outfits with a bottom-up wipe. Deliberately unlabelled. */
export default function Portrait({ ref, portraits, ratio }: { ref?: React.Ref<HTMLDivElement>; portraits: ImageRef[]; ratio: number }) {
  const label = useRef<HTMLDivElement | null>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const cur = useRef(0);
  const busy = useRef(false);

  function nextOutfit() {
    if (busy.current) return;
    const all = imgs.current as HTMLImageElement[];
    const prev = cur.current;
    const next = (prev + 1) % all.length;
    cur.current = next;
    label.current?.setAttribute("aria-label", portraits[next].alt ?? "");
    dispatchEvent(new Event("cursor:spin"));
    if (!initMotion().G) {
      all.forEach((im, j) => im.classList.toggle(styles.on, j === next));
      return;
    }
    busy.current = true;
    all[next].style.zIndex = "2";
    all[prev].style.zIndex = "1";
    all[next].classList.add(styles.on);
    gsap.fromTo(
      all[next],
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.7,
        ease: "expo.inOut",
        onComplete: () => {
          all[prev].classList.remove(styles.on);
          all[next].style.clipPath = "";
          busy.current = false;
        },
      },
    );
  }

  return (
    <div
      ref={(el) => {
        label.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      className={styles.portrait}
      style={{ "--par": ratio } as React.CSSProperties}
      data-ratio={ratio}
      tabIndex={0}
      role="img"
      aria-label={portraits[0]?.alt ?? ""}
      data-cursor-ring="56"
      onClick={nextOutfit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextOutfit();
        }
      }}
    >
      <div className={styles.tilt} data-intro-tilt>
        <div className={styles.stack}>
          {portraits.map((p, i) => (
            <Image
              key={p.url}
              ref={(el) => {
                imgs.current[i] = el;
              }}
              className={i === 0 ? styles.on : undefined}
              src={p.url}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              draggable={false}
              style={{ objectFit: "contain", objectPosition: "bottom" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
