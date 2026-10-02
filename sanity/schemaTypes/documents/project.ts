import { CaseIcon } from "@sanity/icons/Case";
import { defineField, defineType } from "sanity";
import { bool, str, txt } from "../helpers";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hexField = (name: string, title: string, description: string, initialValue: string) =>
  defineField({
    name,
    title,
    type: "string",
    group: "mock",
    description,
    initialValue,
    validation: (rule) => rule.required().regex(HEX, { name: "hex colour", invert: false }).error("Use a hex colour like #1F3B2D."),
  });

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "content", title: "Details", default: true },
    { name: "media", title: "Gallery" },
    { name: "mock", title: "Placeholder look" },
  ],
  fields: [
    str("title", "Title", "The project name, shown large in the list and on the project page.", { group: "content", required: true, max: 40 }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "The web-friendly version of the name. Click Generate; it is used internally to identify the project.",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    str("year", "Year", "The year you built it, e.g. “2026”. Projects without a manual order are sorted by this.", { group: "content", required: true, max: 4 }),
    str("urlLabel", "Short URL label", "The address shown in the browser-bar mockup, e.g. “canteen-queue.vercel.app”. It is only a label, not a link.", { group: "content", max: 40 }),
    txt("description", "Description", "The one-paragraph summary at the top of the project page.", { group: "content", required: true, max: 300 }),
    txt("built", "What I built", "What the project does and what your part was.", { group: "content", required: true, max: 260 }),
    txt("hardest", "Hardest part", "The toughest problem and how you solved it.", { group: "content", required: true, max: 200 }),
    defineField({
      name: "stack",
      title: "Tech stack",
      type: "array",
      group: "content",
      description: "Technologies used, shown as small chips. The first three also appear in the project list. Drag to reorder.",
      of: [{ type: "string", validation: (rule) => rule.max(24) }],
      validation: (rule) => rule.required().min(1).max(10),
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      group: "content",
      description: "Buttons at the bottom of the project page, e.g. “Live demo” and “GitHub”. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "projectLink",
          title: "Link",
          fields: [
            str("label", "Label", "The text of the link. The brackets are added for you.", { required: true, max: 20 }),
            defineField({
              name: "url",
              title: "Address",
              type: "url",
              description: "Where the link goes, starting with https://.",
              validation: (rule) => rule.required().uri({ scheme: ["https", "http"] }),
            }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
    str("note", "Note", "Optional small print next to the links, e.g. “Built for a company, so the code is private.”.", { group: "content", max: 90 }),
    defineField({
      name: "media",
      title: "Media gallery",
      type: "array",
      group: "media",
      description: "Screenshots, videos and diagrams shown in the project page gallery. The first item is the one shown first. Drag to reorder.",
      of: [{ type: "mediaItem" }],
      validation: (rule) => rule.max(12),
    }),
    hexField("themeBackground", "Accent colour: background", "Background of the generated placeholder screens, as a hex code. Only visible until real media is uploaded.", "#1F3B2D"),
    hexField("themeText", "Accent colour: text", "Text colour of the generated placeholder screens, as a hex code.", "#DDEBDF"),
    defineField({
      name: "archLabels",
      title: "Diagram placeholder labels",
      type: "array",
      group: "mock",
      description: "Three words for the generated diagram placeholder: the front end, the back end, and the data store. Only used until a diagram image is uploaded.",
      of: [{ type: "string", validation: (rule) => rule.max(24) }],
      validation: (rule) => rule.max(3),
    }),
    bool("isHidden", "Hide this project", "On keeps the project in the Studio but removes it from the site.", { group: "content", initialValue: false }),
  ],
  orderings: [
    { title: "Year, newest first", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Title", name: "title", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", year: "year", hidden: "isHidden", media: "media.0.image" },
    prepare: ({ title, year, hidden, media }) => ({ title, subtitle: `${year ?? ""}${hidden ? " · hidden" : ""}`, media }),
  },
});
