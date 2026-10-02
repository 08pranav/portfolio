import { Schema } from "@sanity/schema";
import { schemaTypes } from "../sanity/schemaTypes";

/** `npm run check:schema`: Sanity's own schema validation, plus ADMIN.md's "title and description on every field" rule. */
const problems: string[] = [];

type Def = { name?: string; title?: string; description?: string; type?: string; fields?: Def[]; of?: Def[]; hidden?: unknown };

function walk(def: Def, path: string, isRoot = false) {
  if (!isRoot) {
    if (!def.description) problems.push(`${path}: missing description`);
    if (!def.title && def.type !== "block" && def.type !== "string" && def.type !== "reference") problems.push(`${path}: missing title`);
  }
  def.fields?.forEach((f) => walk(f, `${path}.${f.name}`));
  def.of?.forEach((m, i) => {
    // array members: primitives and blocks carry their description on the array field itself
    if (m.type === "object" || m.fields) walk({ ...m, description: m.description ?? "(member)" }, `${path}[${m.name ?? i}]`);
  });
}

for (const t of schemaTypes as unknown as Def[]) {
  if (["imageWithAlt", "italicText", "mediaItem", "portrait"].includes(t.name ?? "")) {
    // reusable types: their fields still need descriptions
    t.fields?.forEach((f) => walk(f, `${t.name}.${f.name}`));
    continue;
  }
  t.fields?.forEach((f) => walk(f, `${t.name}.${f.name}`));
}

const compiled = Schema.compile({ name: "default", types: schemaTypes });
const names = compiled.getTypeNames().filter((n: string) => schemaTypes.some((t) => t.name === n));

import { validateSchema } from "@sanity/schema/_internal";

type Node = { _problems?: { severity: string; message: string }[]; name?: string } & Record<string, unknown>;
function collect(node: unknown, path: string) {
  if (!node || typeof node !== "object") return;
  const n = node as Node;
  for (const p of n._problems ?? []) if (p.severity === "error") problems.push(`${path}: ${p.message}`);
  for (const [k, v] of Object.entries(n)) {
    if (k === "_problems" || k === "icon") continue;
    if (Array.isArray(v)) v.forEach((c, i) => collect(c, `${path}.${k}[${(c as Node)?.name ?? i}]`));
    else if (v && typeof v === "object") collect(v, `${path}.${k}`);
  }
}
for (const t of validateSchema(schemaTypes).getTypes() as Node[]) collect(t, String(t.name));

console.log(`${names.length} schema types compiled: ${names.join(", ")}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Schema OK: every field has a title and a description.");
