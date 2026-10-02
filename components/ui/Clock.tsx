"use client";

import { useSyncExternalStore } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { formatClock } from "@/lib/scroll";

function subscribe(cb: () => void) {
  const id = setInterval(cb, 15000);
  return () => clearInterval(id);
}

/** Live time in the site's time zone, "--:--" until hydrated. */
export default function Clock() {
  const { timeZone } = useSiteConfig();
  const t = useSyncExternalStore(subscribe, () => formatClock(timeZone), () => "--:--");
  return <span suppressHydrationWarning>{t}</span>;
}
