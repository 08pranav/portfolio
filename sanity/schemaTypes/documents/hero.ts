import { SparklesIcon } from "@sanity/icons/Sparkles";
import { defineField, defineType } from "sanity";
import { SECTION_TARGETS } from "../constants";
import { str, txt } from "../helpers";

export default defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  icon: SparklesIcon,
  groups: [
    { name: "masthead", title: "Masthead", default: true },
    { name: "portrait", title: "Portrait" },
    { name: "covers", title: "Cover lines" },
    { name: "intro", title: "Intro" },
  ],
  fields: [
    defineField({
      name: "issue",
      title: "Issue strip",
      type: "object",
      group: "masthead",
      description: "The thin line of small text under the menu bar, like a magazine's issue line.",
      options: { collapsible: false },
      fields: [
        str("left", "Left", "Text at the far left.", { max: 40 }),
        str("center", "Center", "Text in the middle. Hidden on phones to save space.", { max: 60 }),
        str("right", "Right", "Text at the far right. Write {time} where the live clock should appear, e.g. “Mumbai {time} IST”.", { max: 40 }),
      ],
    }),
    str("masthead", "Masthead text", "The huge name across the top of the cover. It is shown in capitals and stretched to the full page width.", { group: "masthead", required: true, max: 10 }),
    defineField({
      name: "portraits",
      title: "Portraits",
      type: "array",
      group: "portrait",
      description: "Cutouts of you in different outfits. The first one shows when the page loads; clicking the portrait cycles through the rest. Drag to reorder.",
      of: [{ type: "portrait" }],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: "coverLines",
      title: "Cover lines",
      type: "array",
      group: "covers",
      description: "The four small blurbs around the portrait, like a magazine cover. The first half sit on the left, the rest on the right. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "coverLine",
          title: "Cover line",
          fields: [
            str("label", "Label", "The small caption above the blurb, e.g. “Inside”.", { required: true, max: 16 }),
            str("bigNumber", "Big number", "Optional. A large italic number beside the text, e.g. “05”.", { max: 4 }),
            defineField({
              name: "textSource",
              title: "Text comes from",
              type: "string",
              description: "“Custom” uses the text below. “Status” shows your status line from Site settings. “Currently” rotates through the lines in the field further down.",
              options: {
                layout: "radio",
                list: [
                  { title: "Custom text", value: "custom" },
                  { title: "My status (from Site settings)", value: "status" },
                  { title: "Rotating “Currently” lines", value: "currently" },
                ],
              },
              initialValue: "custom",
              validation: (rule) => rule.required(),
            }),
            defineField({
              ...txt("text", "Text", "The blurb itself. Only used for custom text.", { rows: 2, max: 90 }),
              hidden: ({ parent }) => parent?.textSource !== "custom",
              validation: (rule) =>
                rule.max(90).custom((value, ctx) => {
                  const src = (ctx.parent as { textSource?: string } | undefined)?.textSource;
                  return src === "custom" && !value ? "Write the text, or pick a different source." : true;
                }),
            }),
            str("linkLabel", "Link label", "The small link under the blurb, e.g. “See the work ↗”.", { required: true, max: 28 }),
            defineField({
              name: "linkTarget",
              title: "Link goes to",
              type: "string",
              description: "Which part of the page the link scrolls to.",
              options: { list: SECTION_TARGETS },
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "text" } },
        },
      ],
      validation: (rule) => rule.max(4).error("The cover has room for four lines."),
    }),
    defineField({
      name: "currentlyLines",
      title: "“Currently” lines",
      type: "array",
      group: "covers",
      description: "Short sentences about what you're up to. They rotate every few seconds in any cover line set to “Rotating Currently lines”. Drag to reorder.",
      of: [{ type: "string", validation: (rule) => rule.max(90).error("Keep each line under 90 characters.") }],
    }),
    defineField({
      name: "intro",
      title: "Intro sentence",
      type: "italicText",
      group: "intro",
      description: "The sentence in the strip at the bottom of the cover. Select words and use the italic button to turn them into the serif italic accent.",
    }),
    str("scrollHint", "Scroll hint label", "The tiny label beside the animated line at the bottom right, e.g. “Scroll”.", { group: "intro", max: 16 }),
  ],
  preview: { prepare: () => ({ title: "Hero" }) },
});
