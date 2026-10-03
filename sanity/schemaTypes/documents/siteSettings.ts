import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";
import { SOCIAL_PLATFORMS } from "../constants";
import { bool, str, txt } from "../helpers";

export default defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "identity", title: "You", default: true },
    { name: "status", title: "Status" },
    { name: "links", title: "Socials and résumé" },
    { name: "appearance", title: "Theme" },
    { name: "seo", title: "Search and sharing" },
    { name: "errors", title: "Error pages" },
  ],
  fields: [
    str("fullName", "Full name", "Your name as it appears in the page title and in search results. The big masthead on the cover has its own field.", { group: "identity", required: true, max: 60 }),
    str("logoText", "Short logo text", "The small mark at the top left of the menu bar, shown in capitals, e.g. “PK.”.", { group: "identity", required: true, max: 6 }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "identity",
      description: "Where people reach you. Shown in the contact section with a copy button. Notes from the form are emailed here.",
      validation: (rule) => rule.required().email().error("Enter a valid email address."),
    }),
    str("location", "Location", "The city you are based in, e.g. “Bandra, Mumbai”. Used in search results and structured data.", { group: "identity", required: true, max: 40 }),
    defineField({
      name: "timeZone",
      title: "Time zone",
      type: "string",
      group: "identity",
      description: "Powers the live clock on the cover and in the contact section. Use an IANA name such as Asia/Kolkata or Europe/London.",
      initialValue: "Asia/Kolkata",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true;
          try {
            new Intl.DateTimeFormat("en-GB", { timeZone: value });
            return true;
          } catch {
            return "That isn't a valid time zone name. Try something like Asia/Kolkata.";
          }
        }),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "object",
      group: "status",
      description: "Whether you are looking for work right now. This drives the green dot in the menu bar and the Status line on the cover.",
      options: { collapsible: false },
      fields: [
        bool("openToWork", "Open to work", "On shows the green dot and the status text. Off hides the dot and the menu bar label.", { initialValue: true }),
        str("shortText", "Menu bar label", "The short text next to the green dot in the menu bar, e.g. “Open to internships”.", { required: true, max: 28 }),
        str("text", "Status line", "The longer sentence on the cover, e.g. “Open to internships for summer 2027, in Mumbai or remote.”.", { required: true, max: 90 }),
      ],
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      group: "links",
      description: "Icon buttons in the contact section. Drag to reorder.",
      of: [
        {
          type: "object",
          name: "social",
          title: "Social link",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              description: "Picks the icon. Choose “Other” for any site without its own icon.",
              options: { list: SOCIAL_PLATFORMS },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Link",
              type: "url",
              description: "The full address of your profile, starting with https://.",
              validation: (rule) => rule.required().uri({ scheme: ["https", "http", "mailto"] }),
            }),
            str("label", "Custom label", "Optional. Read out by screen readers and shown on hover. Leave empty to use the platform name.", { max: 30 }),
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "resume",
      title: "Résumé",
      type: "object",
      group: "links",
      description: "The PDF visitors download from the About section.",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "file",
          title: "PDF file",
          type: "file",
          description: "Upload your résumé as a PDF.",
          options: { accept: "application/pdf" },
        }),
        defineField({
          name: "updatedAt",
          title: "Last updated",
          type: "date",
          description: "Shown on the download button as month and year, e.g. “Sep 2026”.",
          options: { dateFormat: "MMM YYYY" },
        }),
        defineField({
          name: "pages",
          title: "Number of pages",
          type: "number",
          description: "Shown on the download button, e.g. “1 page”. Leave empty to hide it.",
          validation: (rule) => rule.integer().min(1).max(20),
        }),
      ],
    }),
    defineField({
      name: "defaultTheme",
      title: "Default theme",
      type: "string",
      group: "appearance",
      description: "What first-time visitors see. “System” follows their device. Visitors can still switch with the toggle in the menu bar.",
      options: {
        layout: "radio",
        list: [
          { title: "System (follow the visitor's device)", value: "system" },
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
      },
      initialValue: "system",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "Search and sharing",
      type: "object",
      group: "seo",
      description: "How the site looks in Google results, browser tabs and link previews, and what search engines are told about you.",
      options: { collapsible: false },
      fieldsets: [{ name: "structured", title: "Details for search engines", options: { collapsible: true, collapsed: true } }],
      fields: [
        str("title", "Home page title", "The text in the browser tab on the home page, and the headline in search results and link previews.", { required: true, max: 60 }),
        defineField({
          name: "titleTemplate",
          title: "Title template for other pages",
          type: "string",
          description: "How the tab reads on every other page, including each project. Write %s where the page name goes, e.g. “%s — Pranav Koradiya” gives “ParkWise — Pranav Koradiya”.",
          initialValue: "%s — Pranav Koradiya",
          validation: (rule) =>
            rule
              .required()
              .max(70)
              .custom((value) => (!value || value.includes("%s") ? true : "Include %s where the page name should appear.")),
        }),
        txt("description", "Description", "One or two sentences under the headline in search results and link previews.", { required: true, max: 160 }),
        defineField({
          name: "keywords",
          title: "Keywords",
          type: "array",
          description: "A few words people might search for you with. Search engines give these little weight, so a handful is plenty. Drag to reorder.",
          of: [{ type: "string", validation: (rule) => rule.max(40) }],
          validation: (rule) => rule.max(12),
        }),
        defineField({
          name: "canonicalDomain",
          title: "Main domain",
          type: "url",
          description: "For reference only: the address of the live site, https://pranavv.me. The sitemap, link previews and search results take it from the NEXT_PUBLIC_SITE_URL setting in Vercel, so changing this box does not move the site.",
          validation: (rule) =>
            rule.uri({ scheme: ["https"] }).custom((value) => {
              if (!value) return true;
              try {
                const u = new URL(value);
                return u.pathname === "/" && !u.search && !u.hash ? true : "Just the domain, with nothing after it.";
              } catch {
                return "Enter a full address starting with https://.";
              }
            }),
        }),
        defineField({
          name: "shareImage",
          title: "Share image",
          type: "imageWithAlt",
          description: "The picture shown when the home page link is shared on WhatsApp, LinkedIn, X and similar. Use exactly 1200 × 630 pixels; other shapes are cropped to fit.",
        }),
        defineField({
          name: "favicon",
          title: "Favicon",
          type: "imageWithAlt",
          description: "Optional. Leave empty to use the built-in PK icon, which adapts to light and dark browser tabs. Upload a square PNG (at least 64 × 64) only to replace it.",
          options: { accept: "image/png,image/svg+xml,image/x-icon", hotspot: false },
        }),
        defineField({ ...str("jobTitle", "Job title", "Your role, told to search engines on the home page, e.g. “Software Engineer”.", { max: 60, initialValue: "Software Engineer" }), fieldset: "structured" }),
        defineField({ ...str("alumniOf", "School or college", "Where you studied, e.g. “Fr. Conceicao Rodrigues College of Engineering”.", { max: 90 }), fieldset: "structured" }),
        defineField({ ...str("addressLocality", "City", "The city you are based in, e.g. “Mumbai”.", { max: 40 }), fieldset: "structured" }),
        defineField({
          ...str("addressCountry", "Country code", "The two-letter code for your country, e.g. IN for India, GB for the United Kingdom.", { max: 2 }),
          fieldset: "structured",
          validation: (rule) => rule.regex(/^[A-Z]{2}$/, { name: "country code" }).error("Two capital letters, e.g. IN."),
        }),
      ],
    }),
    defineField({
      name: "errorPages",
      title: "Error pages",
      type: "object",
      group: "errors",
      description: "The words on the pages people see when an address doesn't exist (404) or something breaks (500).",
      options: { collapsible: false },
      fields: [
        str("notFoundTitle", "Page not found: headline", "The big line on the 404 page.", { required: true, max: 40 }),
        txt("notFoundBody", "Page not found: message", "One or two sentences under the headline.", { rows: 2, required: true, max: 160 }),
        str("errorTitle", "Something went wrong: headline", "The big line on the error page.", { required: true, max: 40 }),
        txt("errorBody", "Something went wrong: message", "One or two sentences under the headline.", { rows: 2, required: true, max: 160 }),
        str("homeLabel", "Back-home link", "The link back to the home page on both pages.", { required: true, max: 40 }),
        str("retryLabel", "Try-again button", "The button on the error page that tries loading again.", { required: true, max: 24 }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
