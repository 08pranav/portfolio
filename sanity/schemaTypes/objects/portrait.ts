import { defineField, defineType } from "sanity";

/** One outfit cutout for the cover portrait. */
export default defineType({
  name: "portrait",
  title: "Portrait cutout",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Cutout image",
      type: "image",
      description:
        "A transparent PNG or WebP of you, cut out from the background. Use the same size and framing for every outfit so they line up.",
      options: { accept: "image/png,image/webp" },
      validation: (rule) => rule.required().error("Upload the cutout."),
    }),
    defineField({
      name: "alt",
      title: "Description",
      type: "string",
      description: "Read out by screen readers, e.g. “Pranav smiling, wearing glasses and a grey tee”.",
      validation: (rule) => rule.required().max(120),
    }),
  ],
  preview: {
    select: { title: "alt", media: "image" },
    prepare: ({ title, media }) => ({ title: title ?? "Portrait", media }),
  },
});
