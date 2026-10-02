import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectView from "@/components/Work/ProjectView";
import SiteChrome from "@/components/SiteChrome";
import SiteFooter from "@/components/SiteFooter";
import { getContent, getPublishedContent } from "@/sanity/lib/content";
import { jsonLd, projectGraph, truncate } from "@/lib/seo";
import type { SectionKey, SectionTarget } from "@/sanity/lib/types";

export async function generateStaticParams() {
  const { work } = await getPublishedContent();
  return work.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const project = content.work.projects.find((p) => p.slug === slug);
  const { site } = content;
  if (!project) {
    // a missing or hidden project is a 404: title it like one, with the editable wording and template
    return { title: { absolute: site.seo.titleTemplate.replace("%s", site.errorPages.notFoundTitle) }, robots: { index: false, follow: false } };
  }
  const title = project.seo?.metaTitle || project.title;
  const description = project.seo?.metaDescription || truncate(project.description);
  const shared = site.seo.titleTemplate.replace("%s", title);
  const image = {
    url: `/projects/${slug}/og`,
    width: 1200,
    height: 630,
    alt: project.seo?.shareImage?.alt || `${project.title}, a project by ${site.fullName}`,
  };
  return {
    title, // the layout's title template adds the site name
    description,
    keywords: project.stack,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: shared, description, type: "website", siteName: site.fullName, url: `/projects/${slug}`, images: [image] },
    twitter: { card: "summary_large_image", title: shared, description, images: [image.url] },
  };
}

/** A project at its own address. Opening this URL directly (or as a crawler) gets the whole page, not an overlay. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const { work, layout } = content;
  const index = work.projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = work.projects[index];
  const next = work.projects[(index + 1) % work.projects.length];
  const targets: SectionTarget[] = ["top", ...layout.sections.filter((s) => s.visible && s.section !== "hero").map((s) => s.section as Exclude<SectionKey, "hero">)];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(projectGraph(content, project)) }} />
      <SiteChrome content={content} targets={targets} />
      <main id="top">
        <ProjectView
          project={project}
          index={index}
          total={work.projects.length}
          next={{ slug: next.slug, title: next.title }}
          labels={work.labels}
          mode="page"
        />
      </main>
      <SiteFooter contact={content.contact} />
    </>
  );
}
