import { CaseIcon } from "@sanity/icons/Case";
import { defineField, defineType } from "sanity";
import { str } from "../helpers";

export default defineType({
  name: "workSection",
  title: "Work section",
  type: "document",
  icon: CaseIcon,
  fields: [
    str("indexLabel", "Index label", "The small number above the title, e.g. “(01)”.", { max: 8 }),
    str("titleCaps", "Title, capital part", "The bold capitals half of the heading, e.g. “Things”.", { required: true, max: 24 }),
    str("titleItalic", "Title, italic part", "The serif italic half of the heading, e.g. “I've built”.", { required: true, max: 24 }),
    str("subtitle", "Subtitle", "The small line on the right of the heading.", { max: 60 }),
    defineField({
      name: "projects",
      title: "Projects to show",
      type: "array",
      description: "Pick the projects and put them in the order they should appear. Drag to reorder. Leave empty to show every visible project, newest first.",
      of: [{ type: "reference", to: [{ type: "project" }] }],
    }),
    defineField({
      name: "labels",
      title: "Project page labels",
      type: "object",
      description: "The fixed words used inside the project page that opens when someone clicks a project. Brackets are added for you where the design uses them.",
      options: { collapsible: true, collapsed: true },
      fields: [
        str("view", "Cursor label", "The word in the round cursor when hovering a project row.", { required: true, max: 12, initialValue: "View" }),
        str("close", "Close", "Button that closes the project page.", { required: true, max: 12, initialValue: "Close" }),
        str("prev", "Previous", "Gallery button to go back one slide.", { required: true, max: 12, initialValue: "Prev" }),
        str("next", "Next", "Gallery button to go forward one slide.", { required: true, max: 12, initialValue: "Next" }),
        str("nextProject", "Next project", "The small label above the link to the following project.", { required: true, max: 20, initialValue: "Next project" }),
        str("built", "“What I built” heading", "Heading above the project's “what I built” text.", { required: true, max: 24, initialValue: "What I built" }),
        str("hardest", "“Hardest part” heading", "Heading above the project's “hardest part” text.", { required: true, max: 24, initialValue: "Hardest part" }),
        str("stack", "“Tech stack” heading", "Heading above the technology chips.", { required: true, max: 24, initialValue: "Tech stack" }),
        str("kindImage", "Thumbnail tag: screenshot", "Tiny tag on gallery thumbnails of screenshots.", { required: true, max: 12, initialValue: "Screen" }),
        str("kindVideo", "Thumbnail tag: video", "Tiny tag on gallery thumbnails of videos.", { required: true, max: 12, initialValue: "Video" }),
        str("kindMobile", "Thumbnail tag: mobile", "Tiny tag on gallery thumbnails of mobile screenshots.", { required: true, max: 12, initialValue: "Mobile" }),
        str("kindDiagram", "Thumbnail tag: diagram", "Tiny tag on gallery thumbnails of diagrams.", { required: true, max: 12, initialValue: "Diagram" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Work section" }) },
});
