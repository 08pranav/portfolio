import { ImagesIcon } from "@sanity/icons/Images";
import { defineField, defineType } from "sanity";
import { str } from "../helpers";

export default defineType({
  name: "photosSection",
  title: "Photos section",
  type: "document",
  icon: ImagesIcon,
  fields: [
    str("indexLabel", "Index label", "The small number above the title, e.g. “(03)”.", { max: 8 }),
    str("titleItalic", "Title, italic part", "The serif italic half of the heading, e.g. “Through”.", { required: true, max: 24 }),
    str("titleCaps", "Title, capital part", "The bold capitals half of the heading, e.g. “the lens”.", { required: true, max: 24 }),
    str("caption", "Caption", "The small line on the right of the heading, e.g. the camera you shoot with.", { max: 60 }),
    str("scrollHint", "Scroll hint", "Shown under the strip on large screens, where scrolling moves the photos sideways.", { max: 24 }),
    str("swipeHint", "Swipe hint", "Shown under the strip on phones and tablets.", { max: 24 }),
    defineField({
      name: "labels",
      title: "Photo viewer labels",
      type: "object",
      description: "The words in the full-screen viewer that opens when someone clicks a photo. Brackets are added for you where the design uses them.",
      options: { collapsible: true, collapsed: true },
      fields: [
        str("view", "Cursor label", "The word in the round cursor when hovering a photo.", { required: true, max: 12, initialValue: "View" }),
        str("close", "Close", "Button that closes the viewer.", { required: true, max: 12, initialValue: "Close" }),
        str("prev", "Previous", "Button to go back one photo.", { required: true, max: 12, initialValue: "Prev" }),
        str("next", "Next", "Button to go forward one photo.", { required: true, max: 12, initialValue: "Next" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Photos section" }) },
});
