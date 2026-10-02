import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";
import { str, txt } from "../helpers";

export default defineType({
  name: "aboutSection",
  title: "About section",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "intro", title: "Intro", default: true },
    { name: "cv", title: "Experience and education" },
  ],
  fields: [
    str("indexLabel", "Index label", "The small number above the title, e.g. “(02)”.", { group: "intro", max: 8 }),
    str("titleCaps", "Title, capital part", "The bold capitals half of the heading, e.g. “About”.", { group: "intro", required: true, max: 24 }),
    str("titleItalic", "Title, italic part", "The serif italic half of the heading, e.g. “me”.", { group: "intro", required: true, max: 24 }),
    str("sideLabel", "Side label", "The small line on the right of the heading, e.g. “Mumbai, India”.", { group: "intro", max: 40 }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "italicText",
      group: "intro",
      description: "The big paragraph that fills in word by word as you scroll. Select words and use the italic button for the serif accent.",
    }),
    defineField({
      name: "facts",
      title: "Facts",
      type: "array",
      group: "intro",
      description: "Four short facts shown in a row under the lede. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "fact",
          title: "Fact",
          fields: [
            str("label", "Label", "The small caption, e.g. “Studying”.", { required: true, max: 24 }),
            str("value", "Value", "The fact itself, e.g. “Computer Engineering, Fr. CRCE”.", { required: true, max: 60 }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
      validation: (rule) => rule.max(4).error("The row has room for four facts."),
    }),
    str("resumeLabel", "Résumé button label", "The text on the download button. The file and date come from Site settings.", { group: "intro", required: true, max: 28 }),
    str("experienceLabel", "Experience heading", "Heading above the list of roles, e.g. “Experience”.", { group: "cv", max: 24 }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "array",
      group: "cv",
      description: "Roles and internships, newest first. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "experienceItem",
          title: "Role",
          fields: [
            str("when", "When", "Dates, e.g. “Feb – Jun 2026”.", { required: true, max: 30 }),
            str("role", "Role", "Your title, e.g. “SDE Intern”.", { required: true, max: 50 }),
            str("org", "Organisation", "Where, e.g. “Fr. CRCE”.", { required: true, max: 70 }),
            txt("text", "What you did", "One or two sentences.", { rows: 3, max: 220 }),
          ],
          preview: { select: { title: "role", subtitle: "org" } },
        },
      ],
    }),
    str("educationLabel", "Education heading", "Heading above the list of qualifications, e.g. “Education”.", { group: "cv", max: 24 }),
    defineField({
      name: "education",
      title: "Education",
      type: "array",
      group: "cv",
      description: "Schools and degrees, newest first. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "educationItem",
          title: "Qualification",
          fields: [
            str("when", "When", "Years, e.g. “2024 – 2028”.", { required: true, max: 30 }),
            str("title", "Qualification", "e.g. “B.Tech, Computer Engineering”.", { required: true, max: 60 }),
            str("org", "Institution", "e.g. “Fr. Conceicao Rodrigues College of Engineering”.", { required: true, max: 70 }),
            str("note", "Result", "Optional, e.g. “CGPA 8.5 / 10”.", { max: 40 }),
          ],
          preview: { select: { title: "title", subtitle: "org" } },
        },
      ],
    }),
    str("certificationsLabel", "Certifications heading", "Heading above the list of certificates, e.g. “Certifications”.", { group: "cv", max: 24 }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      group: "cv",
      description: "Courses and certificates, one line each. Drag to reorder.",
      of: [{ type: "string", validation: (rule) => rule.max(140) }],
    }),
  ],
  preview: { prepare: () => ({ title: "About section" }) },
});
