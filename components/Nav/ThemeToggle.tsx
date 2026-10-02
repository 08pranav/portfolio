"use client";

import { useSyncExternalStore } from "react";
import Roll from "@/components/ui/Roll";
import { THEME_KEY } from "@/lib/theme-script";

const query = () => matchMedia("(prefers-color-scheme: dark)");

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = query();
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : query().matches;
}

export default function ThemeToggle({ className, toDark, toLight }: { className?: string; toDark: string; toLight: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  return (
    <button type="button" className={className} onClick={toggle} aria-label="Switch colour theme">
      <Roll text={`(${dark ? toLight : toDark})`} />
    </button>
  );
}
