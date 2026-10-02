"use client";

import ErrorPage from "@/components/ErrorPage";
import { base } from "@/content/base";
import { fontClassNames } from "@/lib/fonts";
import { themeScript } from "@/lib/theme-script";
import "./(site)/globals.css";

/** The last resort: the root layout itself failed. Uses the built-in wording since nothing else can be loaded. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { errorPages } = base.site;
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript("system", false) }} />
      </head>
      <body>
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
      </body>
    </html>
  );
}
