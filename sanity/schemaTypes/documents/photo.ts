import { ImageIcon } from "@sanity/icons/Image";
import { orderRankField } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";
import { bool, str } from "../helpers";

export default defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  icon: ImageIcon,
  fields: [
    orderRankField({ type: "photo", newItemPosition: "after", title: "Order", description: "Set by dragging photos in the Photos list. You never edit this by hand." }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description: "Drag the dot to choose the part of the photo that must never be cropped.",
      options: { hotspot: true },
      validation: (rule) => rule.required().error("Upload the photo."),
    }),
    str("place", "Place", "Where it was taken, e.g. “Bandstand”. Shown on hover and in the viewer.", { required: true, max: 40 }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description: "When you took it. Shown as month and year, e.g. “Jan 2026”.",
      options: { dateFormat: "MMM YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "exif",
      title: "Camera settings",
      type: "object",
      description: "Shown in the viewer as a line like “f/2.8 · 1/500s · ISO 160 · 35mm”.",
      options: { columns: 2 },
      fields: [
        str("aperture", "Aperture", "e.g. “f/2.8”.", { max: 8 }),
        str("shutter", "Shutter speed", "e.g. “1/500s”.", { max: 10 }),
        defineField({
          name: "iso",
          title: "ISO",
          type: "number",
          description: "e.g. 160.",
          validation: (rule) => rule.integer().min(25).max(409600),
        }),
        str("focalLength", "Focal length", "e.g. “35mm”.", { max: 10 }),
      ],
    }),
    defineField({
      name: "shape",
      title: "Frame shape",
      type: "string",
      description: "How the photo is framed in the strip: tall (portrait), wide (landscape) or square.",
      options: {
        layout: "radio",
        list: [
          { title: "Tall", value: "tall" },
          { title: "Wide", value: "wide" },
          { title: "Square", value: "square" },
        ],
      },
      initialValue: "tall",
      validation: (rule) => rule.required(),
    }),
    bool("isHidden", "Hide this photo", "On keeps the photo in the Studio but removes it from the site.", { initialValue: false }),
  ],
  orderings: [{ title: "Manual order", name: "manual", by: [{ field: "orderRank", direction: "asc" }] }],
  preview: {
    select: { title: "place", date: "date", shape: "shape", hidden: "isHidden", media: "image" },
    prepare: ({ title, date, shape, hidden, media }) => ({
      title,
      subtitle: [date, shape, hidden ? "hidden" : ""].filter(Boolean).join(" · "),
      media,
    }),
  },
});
