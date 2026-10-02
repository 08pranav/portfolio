import Link from "next/link";
import { isSanityConfigured } from "@/sanity/env";
import { getContent } from "@/sanity/lib/content";
import Studio from "./Studio";

export default async function AdminPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ maxWidth: 560, margin: "15vh auto", padding: 24, font: "16px/1.5 system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 24 }}>The admin panel isn&apos;t connected yet</h1>
        <p>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in <code>.env.local</code>, then restart the dev server. The steps are in
          the Setup section of <code>ADMIN.md</code>.
        </p>
        <p>
          <Link href="/">Back to the site</Link>
        </p>
      </main>
    );
  }
  const { site } = await getContent();
  return <Studio title={site.seo.titleTemplate.replace("%s", "Admin")} />;
}
