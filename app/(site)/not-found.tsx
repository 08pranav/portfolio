import type { Metadata } from "next";
import ErrorPage from "@/components/ErrorPage";
import SiteChrome from "@/components/SiteChrome";
import { getContent } from "@/sanity/lib/content";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

/** A project (or any page) that doesn't exist, inside the normal site shell. */
export default async function NotFound() {
  const content = await getContent();
  const { errorPages } = content.site;
  return (
    <>
      <SiteChrome content={content} targets={["top"]} />
      <ErrorPage code="404" title={errorPages.notFoundTitle} body={errorPages.notFoundBody} homeLabel={errorPages.homeLabel} />
    </>
  );
}
