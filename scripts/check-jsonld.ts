import { tmpdir } from "node:os";
import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/**
 * npm run check:jsonld [baseUrl]   (default http://localhost:3000, needs the site running and a network connection)
 *
 * Fetches the home page and every project page, pulls out the JSON-LD and checks it against the real schema.org
 * vocabulary: every @type exists, every property is defined for that type (or one of its parents), every value is
 * of an accepted kind, URLs are absolute and dates are ISO. Exits non-zero on any error.
 */
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const VOCAB_URL = "https://schema.org/version/latest/schemaorg-current-https.jsonld";
const cache = path.join(tmpdir(), "schemaorg-current-https.jsonld");

type Node = Record<string, unknown>;
const asArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const ids = (v: unknown) => asArray(v as Node | Node[]).map((x) => (x as Node)["@id"] as string).filter(Boolean);

async function loadVocabulary() {
  if (!existsSync(cache)) writeFileSync(cache, await (await fetch(VOCAB_URL)).text());
  const graph = (JSON.parse(readFileSync(cache, "utf8")) as { "@graph": Node[] })["@graph"];
  const byId = new Map<string, Node>(graph.map((n) => [n["@id"] as string, n]));
  const parents = (id: string) => ids(byId.get(id)?.["rdfs:subClassOf"]);
  const ancestors = (id: string) => {
    const seen = new Set<string>([id]);
    const queue = [id];
    while (queue.length) {
      for (const p of parents(queue.shift()!)) {
        if (seen.has(p)) continue;
        seen.add(p);
        queue.push(p);
      }
    }
    return seen;
  };
  return { byId, ancestors };
}

const errors: string[] = [];
const notes: string[] = [];
let checked = 0;

async function main() {
  const { byId, ancestors } = await loadVocabulary();
  const isClass = (id: string) => byId.has(id) && [byId.get(id)!["@type"]].flat().includes("rdfs:Class");
  const TEXTISH: Record<string, RegExp | null> = {
    "schema:Text": null,
    "schema:URL": /^https?:\/\/\S+$/,
    "schema:Date": /^\d{4}(-\d{2}(-\d{2})?)?$/,
    "schema:DateTime": /^\d{4}-\d{2}-\d{2}T/,
    "schema:Number": /^-?\d+(\.\d+)?$/,
  };

  function validate(node: Node, where: string, parentRanges?: string[]) {
    const types = asArray(node["@type"] as string | string[]);
    if (!types.length) return errors.push(`${where}: object without @type`);
    const typeIds = types.map((t) => `schema:${t}`);
    for (const t of typeIds) if (!isClass(t)) errors.push(`${where}: "${t.slice(7)}" is not a schema.org type`);
    const allTypes = new Set(typeIds.flatMap((t) => [...ancestors(t)]));
    if (parentRanges && !parentRanges.some((r) => allTypes.has(r))) errors.push(`${where}: ${types.join("/")} is not an accepted value here (expects ${parentRanges.map((r) => r.slice(7)).join(" or ")})`);
    checked++;

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("@")) continue;
      const propId = `schema:${key}`;
      const prop = byId.get(propId);
      if (!prop) {
        errors.push(`${where}.${key}: not a schema.org property`);
        continue;
      }
      const domains = ids(prop["schema:domainIncludes"]);
      if (!domains.some((d) => allTypes.has(d))) errors.push(`${where}.${key}: not defined for ${types.join("/")} (valid on ${domains.map((d) => d.slice(7)).join(", ")})`);
      const ranges = ids(prop["schema:rangeIncludes"]);
      for (const [i, v] of asArray(value as unknown).entries()) {
        const at = `${where}.${key}${Array.isArray(value) ? `[${i}]` : ""}`;
        if (v && typeof v === "object") {
          const o = v as Node;
          if ("@type" in o) validate(o, at, ranges);
          else if (Object.keys(o).length === 1 && "@id" in o) notes.push(`${at}: reference to ${o["@id"]}`);
          else errors.push(`${at}: object without @type`);
        } else if (typeof v === "string") {
          const kinds = ranges.filter((r) => r in TEXTISH);
          if (!kinds.length) notes.push(`${at}: text given where ${ranges.map((r) => r.slice(7)).join("/")} is expected (accepted by search engines)`);
          else if (!kinds.some((k) => TEXTISH[k] === null || TEXTISH[k]!.test(v))) errors.push(`${at}: "${v.slice(0, 40)}" is not a valid ${kinds.map((k) => k.slice(7)).join("/")}`);
          else if (["url", "image", "item", "sameAs"].includes(key) && !/^https?:\/\//.test(v)) errors.push(`${at}: must be an absolute URL`);
        } else if (typeof v === "number") {
          if (!ranges.some((r) => ["schema:Number", "schema:Integer", "schema:Float"].includes(r))) errors.push(`${at}: number not accepted`);
        }
      }
    }
  }

  const get = async (p: string) => (await fetch(base + p, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } })).text();
  const home = await get("/");
  const slugs = [...new Set([...home.matchAll(/href="\/projects\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  for (const route of ["/", ...slugs.map((s) => `/projects/${s}`)]) {
    const html = await get(route);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    console.log(`\n${route}: ${blocks.length} JSON-LD block(s)`);
    if (!blocks.length) errors.push(`${route}: no JSON-LD`);
    for (const raw of blocks) {
      let data: Node;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        errors.push(`${route}: invalid JSON (${(e as Error).message})`);
        continue;
      }
      if (data["@context"] !== "https://schema.org") errors.push(`${route}: @context must be https://schema.org`);
      const nodes = asArray(data["@graph"] as Node | Node[]);
      for (const n of nodes) {
        validate(n, `${route} ${n["@type"]}`);
        console.log(`  ok  ${String(n["@type"]).padEnd(15)} ${Object.keys(n).filter((k) => !k.startsWith("@")).join(", ")}`);
      }
      // breadcrumbs must count 1, 2, 3...
      for (const n of nodes.filter((x) => x["@type"] === "BreadcrumbList")) {
        const pos = asArray(n.itemListElement as Node[]).map((i) => i.position);
        if (pos.some((p, i) => p !== i + 1)) errors.push(`${route}: breadcrumb positions are ${pos.join(",")}`);
      }
    }
  }
  console.log(`\nchecked ${checked} schema.org objects`);
  if (notes.length) console.log(`notes (${notes.length}):\n  ${[...new Set(notes)].join("\n  ")}`);
  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("JSON-LD OK: valid JSON, every type and property exists in schema.org and is used on the right type.");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
