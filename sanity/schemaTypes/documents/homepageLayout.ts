import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { defineField, defineType } from "sanity";
import { LAYOUT_SECTIONS } from "../constants";
import { bool, str } from "../helpers";

export default defineType({
  name: "homepageLayout",
  title: "Homepage layout",
  type: "document",
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      description: "The order of the page, top to bottom. Drag to reorder. Switch “Show on site” off to hide a section without deleting it.",
      of: [
        {
          type: "object",
          name: "layoutSection",
          title: "Section",
          fields: [
            defineField({
              name: "section",
              title: "Section",
              type: "string",
              description: "Which part of the page this row controls.",
              options: { list: LAYOUT_SECTIONS },
              validation: (rule) => rule.required(),
            }),
            bool("visible", "Show on site", "Off hides this section and its menu links' target from the page.", { initialValue: true }),
          ],
          preview: {
            select: { title: "section", visible: "visible" },
            prepare: ({ title, visible }) => ({ title, subtitle: visible === false ? "Hidden" : "Shown" }),
          },
        },
      ],
      validation: (rule) =>
        rule.required().custom((rows) => {
          const keys = (rows as { section?: string }[] | undefined)?.map((r) => r.section) ?? [];
          const dupes = keys.filter((k, i) => k && keys.indexOf(k) !== i);
          return dupes.length ? `“${dupes[0]}” appears more than once.` : true;
        }),
    }),
    defineField({
      name: "loader",
      title: "Opening animation",
      type: "object",
      description: "The counting screen that plays when the site first opens.",
      options: { collapsible: false },
      fields: [
        bool("enabled", "Show the opening animation", "Off skips straight to the page. It is also skipped for visitors who prefer reduced motion.", { initialValue: true }),
        str("caption", "Caption", "The small line in the bottom corner of the opening screen.", { max: 60 }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage layout" }) },
});
