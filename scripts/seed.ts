import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { createSchema } from "sanity";
import { createClient } from "@sanity/client";
import { validateDocument } from "@sanity/validation";
import { defaults } from "../content/defaults";
import type { Seed } from "../content/seed-type";
import {
  addKeys,
  aboutSectionDoc,
  contactSectionDoc,
  heroDoc,
  homepageLayoutDoc,
  navigationDoc,
  photosSectionDoc,
  projectDoc,
  siteSettingsDoc,
  workSectionDoc,
} from "../sanity/lib/documents";
import { schemaTypes } from "../sanity/schemaTypes";

/**
 * npm run seed            writes content/seed.json (your résumé details) into the dataset, uploads the portraits from
 *                         assets/portrait and the résumé PDF, and never overwrites an existing document
 * npm run seed -- --force replaces existing documents with the seed content
 * npm run seed -- --dry   does everything except upload and write (no credentials needed)
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (an Editor token) in .env.local.
 * "TODO" values in seed.json are left empty and listed at the end.
 */
const seed = JSON.parse(readFileSync(path.resolve("content/seed.json"), "utf8")) as Seed;

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local: fine for --dry
}

const dry = process.argv.includes("--dry");
const force = process.argv.includes("--force");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!dry && (!projectId || !token)) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first (see .env.example).");
  process.exit(1);
}

const client = dry ? null : createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });
const MIME: Record<string, string> = { ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };

async function upload(kind: "image" | "file", abs: string) {
  if (!existsSync(abs)) throw new Error(`Missing file: ${abs}`);
  const name = path.basename(abs);
  if (dry || !client) {
    console.log(`  [dry] would upload ${name} (${Math.round(statSync(abs).size / 1024)} KB)`);
    return `dry-${name}`;
  }
  const asset = await client.assets.upload(kind, createReadStream(abs), { filename: name, contentType: MIME[path.extname(abs)] });
  console.log(`  uploaded ${name}`);
  return asset._id;
}

const assetRef = (type: "image" | "file", id: string) => ({ _type: type, asset: { _type: "reference", _ref: id } });

type Doc = { _id: string; _type: string } & Record<string, unknown>;
const todos: string[] = [];

/** Pages in a PDF, by counting page objects. Good enough for a one-page résumé; undefined if unsure. */
function pdfPages(abs: string) {
  const n = (readFileSync(abs).toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  return n > 0 ? n : undefined;
}

async function main() {
  const docs: Doc[] = [];

  // hero: the PNG masters in assets/portrait, in the order from seed.json
  console.log("Portraits (assets/portrait)");
  const hero = heroDoc() as unknown as Doc & { portraits: Record<string, unknown>[] };
  for (let i = 0; i < seed.hero.portraits.length; i++) {
    const id = await upload("image", path.resolve("assets/portrait", `${seed.hero.portraits[i]}.png`));
    hero.portraits[i].image = assetRef("image", id);
  }
  docs.push({ ...hero, _id: "hero" });

  // site settings: résumé PDF from the project root
  console.log("Résumé");
  const resumeFile = path.resolve(seed.site.resume);
  const site = siteSettingsDoc() as unknown as Doc & { resume: Record<string, unknown> };
  site.resume = {
    file: assetRef("file", await upload("file", resumeFile)),
    updatedAt: statSync(resumeFile).mtime.toISOString().slice(0, 10),
    pages: pdfPages(resumeFile),
  };
  docs.push({ ...site, _id: "siteSettings" });

  docs.push({ ...(navigationDoc() as unknown as Doc), _id: "navigation" });
  docs.push({ ...(homepageLayoutDoc() as unknown as Doc), _id: "homepageLayout" });
  docs.push({ ...(aboutSectionDoc() as unknown as Doc), _id: "aboutSection" });
  docs.push({ ...(photosSectionDoc() as unknown as Doc), _id: "photosSection" });
  docs.push({ ...(contactSectionDoc() as unknown as Doc), _id: "contactSection" });

  const projects = defaults.work.projects.map((p) => projectDoc(p) as unknown as Doc);
  docs.push(...projects, { ...(workSectionDoc(projects.map((p) => p._id)) as unknown as Doc), _id: "workSection" });

  // TODO items: written empty, reported at the end
  for (const [i, s] of defaults.site.socials.entries()) if (!s.url) todos.push(`Site settings → Social links → ${s.platform}: add the profile link (item ${i + 1})`);
  if (typeof seed.photos === "string") todos.push("Photos → Photos: upload real photos (image, place, date, camera settings, frame shape)");

  // validate every document against the real schema before writing anything
  console.log("\nValidating against the schema");
  const schema = createSchema({ name: "default", types: schemaTypes });
  let blocked = 0;
  for (const raw of docs) {
    const doc = addKeys(raw);
    const { markers } = await validateDocument({ document: doc as never, schema: schema as never, getDocumentExists: async () => true });
    for (const m of markers) {
      const where = m.path.map((p: unknown) => (typeof p === "object" ? "[]" : String(p))).join(".");
      const expectedTodo = doc._type === "siteSettings" && /^socials\./.test(where) && where.endsWith(".url");
      const tag = expectedTodo ? "todo " : m.level === "error" ? "ERROR" : "warn ";
      console.log(`  ${tag} ${doc._id} ${where}: ${m.message}`);
      if (m.level === "error" && !expectedTodo) blocked++;
    }
  }
  if (blocked) {
    console.error(`\n${blocked} validation error(s). Nothing was written. Fix content/seed.json or the schema limit, then re-run.`);
    process.exit(1);
  }

  console.log(`\n${docs.length} documents${dry ? " (dry run, nothing written)" : ""}:`);
  for (const d of docs) console.log(`  ${d._type.padEnd(15)} ${d._id}`);

  if (!dry && client) {
    const tx = client.transaction();
    for (const d of docs) {
      if (force) tx.createOrReplace(addKeys(d));
      else tx.createIfNotExists(addKeys(d));
    }
    await tx.commit();
    console.log(`\nDone${force ? " (existing documents replaced)" : " (existing documents left untouched; use --force to replace them)"}.`);
  }

  console.log("\nStill to fill in /admin:");
  for (const t of todos) console.log(`  [ ] ${t}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
