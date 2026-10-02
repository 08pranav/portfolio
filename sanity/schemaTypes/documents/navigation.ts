import { MenuIcon } from "@sanity/icons/Menu";
import { defineField, defineType } from "sanity";
import { SECTION_TARGETS } from "../constants";
import { str } from "../helpers";

export default defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: MenuIcon,
  fields: [
    defineField({
      name: "links",
      title: "Menu links",
      type: "array",
      description: "The links in the menu bar and the full-screen mobile menu. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "navLink",
          title: "Link",
          fields: [
            str("label", "Label", "The word shown in the menu, e.g. “Work”. The brackets are added for you.", { required: true, max: 16 }),
            defineField({
              name: "target",
              title: "Goes to",
              type: "string",
              description: "Which part of the page the link scrolls to.",
              options: { list: SECTION_TARGETS },
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "target" } },
        },
      ],
      validation: (rule) => rule.required().min(1).max(6),
    }),
    str("menuFooterLeft", "Mobile menu footer, left", "The line at the bottom left of the full-screen mobile menu.", { max: 60 }),
    str("menuFooterRight", "Mobile menu footer, right", "The line at the bottom right of the mobile menu. Write {time} where the live clock should appear, e.g. “Mumbai {time} IST”.", { max: 40 }),
    defineField({
      name: "labels",
      title: "Button labels",
      type: "object",
      description: "The words on the menu bar buttons. The brackets are added for you.",
      options: { collapsible: false },
      fields: [
        str("menu", "Open menu", "Button that opens the mobile menu.", { required: true, max: 12, initialValue: "Menu" }),
        str("close", "Close menu", "Button that closes the mobile menu.", { required: true, max: 12, initialValue: "Close" }),
        str("toDark", "Switch to dark", "Theme button text while the site is light.", { required: true, max: 12, initialValue: "Dark" }),
        str("toLight", "Switch to light", "Theme button text while the site is dark.", { required: true, max: 12, initialValue: "Light" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Navigation" }) },
});
