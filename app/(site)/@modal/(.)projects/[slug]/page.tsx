import { notFound } from "next/navigation";
import ProjectOverlay from "@/components/Work/ProjectOverlay";
import { getContent } from "@/sanity/lib/content";

/** Intercepts /projects/<slug> when it is followed from inside the site, so it opens over the home page. */
export default async function InterceptedProject({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { work } = await getContent();
  const index = work.projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const next = work.projects[(index + 1) % work.projects.length];
  return (
    <ProjectOverlay
      project={work.projects[index]}
      index={index}
      total={work.projects.length}
      next={{ slug: next.slug, title: next.title }}
      labels={work.labels}
    />
  );
}
