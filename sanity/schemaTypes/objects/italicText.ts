import { defineArrayMember, defineType } from "sanity";

/** One paragraph of plain text where "Italic accent" marks become the serif italic words on the site. */
export default defineType({
  name: "italicText",
  title: "Text with italic accents",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: {
        decorators: [{ title: "Italic accent", value: "em" }],
        annotations: [],
      },
    }),
  ],
  validation: (rule) => rule.required().max(1).error("Use a single paragraph."),
});
