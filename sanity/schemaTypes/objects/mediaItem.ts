import { defineField, defineType } from "sanity";

const FILE_TYPES = ["image", "mobile", "diagram"];
const VIDEO_TYPES = ["videoFile", "videoUrl"];

/** One slide in a project gallery. */
export default defineType({
  name: "mediaItem",
  title: "Gallery item",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      description: "What kind of media this is. It decides which file field appears below and the small label on the thumbnail.",
      options: {
        layout: "radio",
        list: [
          { title: "Screenshot (image)", value: "image" },
          { title: "Video (upload a file)", value: "videoFile" },
          { title: "Video (paste a link)", value: "videoUrl" },
          { title: "Mobile screenshot", value: "mobile" },
          { title: "Diagram (image)", value: "diagram" },
        ],
      },
      initialValue: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image file",
      type: "image",
      description: "The screenshot or diagram. If you leave this empty the site shows a generated placeholder instead.",
      options: { hotspot: true },
      hidden: ({ parent }) => !FILE_TYPES.includes(parent?.type),
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const t = (ctx.parent as { type?: string } | undefined)?.type;
          return !value && t && FILE_TYPES.includes(t)
            ? { message: "No file yet, so the site will show a generated placeholder.", level: "warning" }
            : true;
        }),
    }),
    defineField({
      name: "videoFile",
      title: "Video file",
      type: "file",
      description: "An MP4 or WebM clip. Keep it short and under about 20 MB so it loads quickly.",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.type !== "videoFile",
    }),
    defineField({
      name: "videoUrl",
      title: "Video link",
      type: "url",
      description: "A direct link to a video file, for example one hosted on your own storage.",
      hidden: ({ parent }) => parent?.type !== "videoUrl",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      type: "image",
      description: "The still shown before the video plays.",
      hidden: ({ parent }) => !VIDEO_TYPES.includes(parent?.type),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "A few words under the gallery, e.g. “Counter dashboard”.",
      validation: (rule) => rule.required().max(60).error("Add a short caption (up to 60 characters)."),
    }),
    defineField({
      name: "mock",
      title: "Placeholder layout",
      type: "string",
      description: "Only used while there is no file: picks the look of the generated stand-in for screenshots.",
      options: {
        list: [
          { title: "Home page", value: "home" },
          { title: "Dashboard", value: "dash" },
          { title: "List", value: "list" },
        ],
      },
      hidden: ({ parent }) => parent?.type !== "image",
    }),
    defineField({
      name: "duration",
      title: "Placeholder video length",
      type: "string",
      description: "Only used while there is no video file, e.g. “0:42”.",
      hidden: ({ parent }) => !VIDEO_TYPES.includes(parent?.type),
    }),
  ],
  preview: {
    select: { title: "caption", type: "type", media: "image" },
    prepare: ({ title, type, media }) => ({ title: title ?? "Untitled", subtitle: type, media }),
  },
});
