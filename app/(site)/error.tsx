"use client";

import { useEffect } from "react";
import ErrorPage from "@/components/ErrorPage";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { useTabTitle } from "@/hooks/useTabTitle";

/** Something threw while rendering a page: show the site-styled 500, with a way to try again. */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { errorPages } = useSiteConfig();
  useTabTitle(errorPages.errorTitle);
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorPage
      code="500"
      title={errorPages.errorTitle}
      body={errorPages.errorBody}
      homeLabel={errorPages.homeLabel}
      action={
        <button type="button" onClick={reset} style={{ all: "unset", cursor: "pointer", fontSize: 15, borderBottom: "1px solid currentColor", alignSelf: "flex-start" }}>
          {errorPages.retryLabel}
        </button>
      }
    />
  );
}
