import { parse, evaluate } from "groq-js";
import { CONTENT_QUERY } from "../sanity/lib/queries";
import { resolveContent } from "../sanity/lib/content";
import { defaults } from "../content/defaults";
import {
  aboutSectionDoc, contactSectionDoc, heroDoc, homepageLayoutDoc, navigationDoc, photosSectionDoc, projectDoc,
  siteSettingsDoc, workSectionDoc,
} from "../sanity/lib/documents";

/** `npm run check:query`: runs the real GROQ query against in-memory documents and feeds the result through resolveContent. */
const asset = (id: string, w: number, h: number) => ({
  _id: id, _type: "sanity.imageAsset", url: `https://cdn.sanity.io/images/x/y/${id}.webp`,
  metadata: { dimensions: { width: w, height: h }, lqip: "data:image/jpeg;base64,AAAA" },
});
const ref = (id: string) => ({ _type: "image", asset: { _type: "reference", _ref: id } });

const projects = defaults.work.projects.map((p) => projectDoc(p) as Record<string, unknown>);
const hero = heroDoc() as { portraits: Record<string, unknown>[] } & Record<string, unknown>;
hero.portraits.forEach((p, i) => (p.image = ref(`img-portrait-${i}`)));

const dataset = [
  { ...(siteSettingsDoc() as object), _id: "siteSettings" },
  { ...(navigationDoc() as object), _id: "navigation" },
  { ...(homepageLayoutDoc() as object), _id: "homepageLayout" },
  { ...hero, _id: "hero" },
  { ...(aboutSectionDoc() as object), _id: "aboutSection" },
  { ...(photosSectionDoc() as object), _id: "photosSection" },
  { ...(contactSectionDoc() as object), _id: "contactSection" },
  ...projects,
  { ...(workSectionDoc([projects[1]._id as string, projects[0]._id as string]) as object), _id: "workSection" },
  { _id: "photo-a", _type: "photo", orderRank: "0|a:", place: "Bandstand", date: "2026-01-15", image: { ...ref("img-photo-a"), hotspot: { x: 0.3, y: 0.7 } }, exif: { aperture: "f/2.8", iso: 160 } },
  { _id: "photo-b", _type: "photo", orderRank: "0|b:", place: "Hidden one", date: "2026-01-15", image: ref("img-photo-a"), isHidden: true },
  { _id: "photo-c", _type: "photo", orderRank: "0|0:", place: "First by rank", date: "2025-12-01", image: ref("img-photo-a") },
  ...[0, 1, 2, 3].map((i) => asset(`img-portrait-${i}`, 1600, 1000)),
  asset("img-photo-a", 3000, 2000),
];

const fail: string[] = [];
let checks = 0;
const ok = (cond: boolean, msg: string) => { checks++; if (!cond) fail.push(msg); };

const run = async (ds: unknown[]) => {
  const raw = await (await evaluate(parse(CONTENT_QUERY), { dataset: ds })).get();
  return { raw, content: resolveContent(raw) };
};

(async () => {
  const { content: c } = await run(dataset);
  ok(c.hero.portraits[0].url.includes("img-portrait-0"), "hero portrait comes from the Sanity asset");
  ok(c.hero.portraits[0].width === 1600, "portrait dimensions projected");
  ok(c.work.projects[0].title === "Blue Carbon Registry", "Work section reference order is respected");
  ok(c.work.projects[0].theme.background === "#0E3B3A", "project theme projected");
  ok(c.work.projects[1].media[0].type === "mobile" && c.work.projects[1].note === "Built for a company, so the code is private.", "media type and project note projected");
  ok(c.photos.photos.map((p) => p.place).join() === "First by rank,Bandstand", "photos ordered by rank, hidden excluded");
  ok(c.photos.photos[1].image?.hotspot?.x === 0.3, "photo hotspot projected");
  ok(!!c.photos.photos[1].image?.lqip?.startsWith("data:"), "photo lqip projected");
  ok((c.about.lede[0] as unknown as { children: { marks?: string[] }[] }).children.some((s) => s.marks?.includes("em")), "rich text keeps em marks");
  ok(c.layout.sections.length === 5 && c.layout.sections.every((s) => s.visible), "layout sections default to visible");
  ok(c.contact.form.topics.length === 4, "contact topics projected");
  ok(c.site.socials.map((x) => x.platform).join() === "GitHub,LinkedIn" && c.site.resume.url === undefined, "socials without an address are skipped; missing résumé file is absent, not null");
  ok(c.about.experience.length === 4 && c.about.education.length === 3 && c.about.certifications.length === 4, "experience, education, certifications projected");
  ok(c.hero.coverLines.map((l) => l.textSource).join() === "custom,custom,status,currently" && c.hero.coverLines[1].bigNumber === "115+", "cover lines projected");

  // projects empty on the section: every visible project, newest first
  const noRefs = dataset.map((d) => ((d as { _id: string })._id === "workSection" ? { ...d, projects: [] } : d));
  const all = (await run(noRefs)).content.work.projects;
  ok(all.length === 3 && all[0].year === "2026", "empty project list falls back to all visible projects, newest first");

  // a hidden project drops out
  const hidden = noRefs.map((d) => ((d as { _id: string })._id === "project-ezeeco-smart-home" ? { ...d, isHidden: true } : d));
  ok((await run(hidden)).content.work.projects.length === 2, "hidden project removed");

  // empty dataset: everything falls back to the built-in defaults
  const empty = (await run([])).content;
  ok(empty.hero.masthead === defaults.hero.masthead && empty.work.projects.length === 3, "empty dataset renders defaults");

  // partially seeded: existing documents win, missing ones fall back
  const partial = (await run(dataset.filter((d) => (d as { _id: string })._id !== "navigation" && (d as { _id: string })._id !== "photosSection"))).content;
  ok(partial.navigation.links.length === 4, "missing navigation document falls back");

  if (fail.length) {
    console.error(`${fail.length} check(s) failed:\n- ${fail.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`Query OK: ${checks} checks passed against in-memory documents.`);
})();
