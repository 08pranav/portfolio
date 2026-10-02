export const SECTION_TARGETS = [
  { title: "Top of the page (cover)", value: "top" },
  { title: "Work", value: "work" },
  { title: "About", value: "about" },
  { title: "Photos", value: "photos" },
  { title: "Contact", value: "contact" },
];

export const LAYOUT_SECTIONS = [
  { title: "Hero (cover)", value: "hero" },
  { title: "Work", value: "work" },
  { title: "About", value: "about" },
  { title: "Photos", value: "photos" },
  { title: "Contact", value: "contact" },
];

export const SOCIAL_PLATFORMS = ["GitHub", "LinkedIn", "Instagram", "Pinterest", "X", "Behance", "Dribbble", "YouTube", "Other"].map(
  (value) => ({ title: value, value }),
);

/** One-of-a-kind documents. Document ID = type name. */
export const SINGLETONS = [
  "siteSettings",
  "navigation",
  "homepageLayout",
  "hero",
  "workSection",
  "aboutSection",
  "photosSection",
  "contactSection",
] as const;
