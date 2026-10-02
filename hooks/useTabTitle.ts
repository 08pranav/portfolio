"use client";

import { useEffect } from "react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

/**
 * Sets the browser tab to "<page> — Pranav Koradiya" (the template from the admin) while `page` is set, and puts the
 * previous title back as soon as it is cleared or the component unmounts.
 *
 *   useTabTitle(open ? project.title : null);   // project page overlay
 */
export function useTabTitle(page: string | null | undefined) {
  const { titleTemplate } = useSiteConfig();

  useEffect(() => {
    if (!page) return;
    const previous = document.title;
    document.title = titleTemplate.replace("%s", page);
    return () => {
      document.title = previous;
    };
  }, [page, titleTemplate]);
}
