"use client";

import { useEffect } from "react";

/**
 * Once you're signed in, the Studio retitles the tab itself ("Structure | …", or the name of the document you have
 * open). This keeps the admin tab on the title chosen in Site settings → SEO, e.g. "Admin — Pranav Koradiya".
 */
export default function TabTitle({ title }: { title: string }) {
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
