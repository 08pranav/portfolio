"use client";

import { createContext, useContext } from "react";

type SiteConfig = { timeZone: string; titleTemplate: string };
const Ctx = createContext<SiteConfig>({ timeZone: "Asia/Kolkata", titleTemplate: "%s" });

/** Site-wide values client components need, from Site settings: the clock's time zone and the tab-title template. */
export default function SiteConfigProvider({ timeZone, titleTemplate, children }: SiteConfig & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ timeZone, titleTemplate }}>{children}</Ctx.Provider>;
}

export const useSiteConfig = () => useContext(Ctx);
