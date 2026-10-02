import { visionTool } from "@sanity/vision";
import { EyeOpenIcon } from "@sanity/icons/EyeOpen";
import { defineConfig } from "sanity";
import { defineLocations, presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import ViewSite from "./sanity/components/ViewSite";
import { apiVersion, dataset, projectId, studioBasePath } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { SINGLETONS } from "./sanity/schemaTypes/constants";
import { structure } from "./sanity/structure";

const singletons = new Set<string>(SINGLETONS);
const system = new Set<string>(["inboxNote"]);

/** Every document lives on the one-page site, so every document previews at "/". */
const home = defineLocations({ locations: [{ title: "Homepage", href: "/" }] });
const locationTypes = [...SINGLETONS, "project", "photo"];

export default defineConfig({
  name: "default",
  title: "Pranav Koradiya: portfolio",
  basePath: studioBasePath,
  projectId: projectId || "unconfigured",
  dataset,
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType) && !system.has(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) => {
      if (singletons.has(schemaType)) return prev.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action));
      if (system.has(schemaType)) return prev.filter(({ action }) => action === "delete");
      return prev;
    },
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: { initial: "/", previewMode: { enable: "/api/draft-mode/enable", disable: "/api/draft-mode/disable" } },
      resolve: { locations: Object.fromEntries(locationTypes.map((t) => [t, home])) },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  tools: (prev) => [...prev, { name: "site", title: "View site", icon: EyeOpenIcon, component: ViewSite }],
});
