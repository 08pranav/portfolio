"use client";

import { createContext, useContext } from "react";

type ErrorPages = { notFoundTitle: string; notFoundBody: string; errorTitle: string; errorBody: string; homeLabel: string; retryLabel: string };
type SiteConfig = { timeZone: string; titleTemplate: string; errorPages: ErrorPages };
const Ctx = createContext<SiteConfig>({
  timeZone: "Asia/Kolkata",
  titleTemplate: "%s",
  errorPages: { notFoundTitle: "", notFoundBody: "", errorTitle: "", errorBody: "", homeLabel: "", retryLabel: "" },
});

/** Site-wide values client components need, from Site settings: the clock's time zone and the tab-title template. */
export default function SiteConfigProvider({ timeZone, titleTemplate, errorPages, children }: SiteConfig & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ timeZone, titleTemplate, errorPages }}>{children}</Ctx.Provider>;
}

export const useSiteConfig = () => useContext(Ctx);
