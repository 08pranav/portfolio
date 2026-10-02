import { defineField, defineType } from "sanity";

/** Image with a description for screen readers. */
export default defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Description",
      type: "string",
      description: "Describe what is in the picture, for people using screen readers and for search engines.",
    }),
  ],
});
