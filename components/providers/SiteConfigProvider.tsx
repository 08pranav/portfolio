"use client";

import { createContext, useContext } from "react";

type SiteConfig = { timeZone: string };
const Ctx = createContext<SiteConfig>({ timeZone: "Asia/Kolkata" });

/** Site-wide values client components need (currently the clock's time zone, from Site settings). */
export default function SiteConfigProvider({ timeZone, children }: SiteConfig & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ timeZone }}>{children}</Ctx.Provider>;
}

export const useSiteConfig = () => useContext(Ctx);
