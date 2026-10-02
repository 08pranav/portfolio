import { defineField, defineType } from "sanity";

/** An image that can't be saved without a description: search engines and screen readers depend on it. */
export default defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Description (alt text)",
      type: "string",
      description:
        "Say what is in the picture in one short sentence, e.g. “Dashboard showing parking spots on a map”. Read aloud by screen readers and used by search engines.",
      validation: (rule) => rule.required().max(140).error("Describe the picture (up to 140 characters)."),
    }),
  ],
});
