import Nav from "@/components/Nav/Nav";
import Cursor from "@/components/ui/Cursor";
import Veil from "@/components/ui/Veil";
import type { SectionTarget, SiteContent } from "@/sanity/lib/types";

/** The menu bar, the long-jump veil and the custom cursor: shared by the home page, project pages and the 404. */
export default function SiteChrome({ content, targets }: { content: SiteContent; targets: SectionTarget[] }) {
  const { site, navigation } = content;
  // a link to a section that is switched off in the admin is dropped
  const links = navigation.links.filter((l) => targets.includes(l.target));
  return (
    <>
      <Nav navigation={{ ...navigation, links }} logoText={site.logoText} status={site.status} />
      <Veil />
      <Cursor />
    </>
  );
}
