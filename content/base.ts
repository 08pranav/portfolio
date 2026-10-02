import type { RichText, SiteContent } from "@/sanity/lib/types";

/**
 * The skeleton of the site's content: every fixed label, button word and structural default, with nothing personal in it.
 * content/seed.json (your real details) is applied on top in content/defaults.ts.
 */

type Seg = string | { it: string };

/** One paragraph of rich text; { it } segments get the italic accent mark. */
export function rich(...segs: Seg[]): RichText {
  return [
    {
      _type: "block",
      _key: "intro",
      style: "normal",
      markDefs: [],
      children: segs.map((s, i) =>
        typeof s === "string"
          ? { _type: "span", _key: `s${i}`, text: s, marks: [] }
          : { _type: "span", _key: `s${i}`, text: s.it, marks: ["em"] },
      ),
    },
  ] as RichText;
}

const portrait = (file: string, alt: string) => ({ url: `/portrait/${file}.webp`, alt, width: 1536, height: 994 });

export const base: SiteContent = {
  site: {
    fullName: "",
    logoText: "",
    email: "",
    location: "",
    timeZone: "Asia/Kolkata",
    status: { openToWork: true, shortText: "Open to work", text: "" },
    socials: [],
    resume: {},
    defaultTheme: "system",
    errorPages: {
      notFoundTitle: "Page not found",
      notFoundBody: "That address doesn't lead anywhere on this site. The page may have moved, or the link may have a typo.",
      errorTitle: "Something went wrong",
      errorBody: "The page failed to load. It isn't you, and trying again in a moment usually fixes it.",
      homeLabel: "Back to the home page",
      retryLabel: "Try again",
    },
    seo: {
      title: "Pranav Koradiya",
      titleTemplate: "%s — Pranav Koradiya",
      description: "",
      keywords: [],
      jobTitle: "Software Engineer",
      alumniOf: "",
      addressLocality: "",
      addressCountry: "",
    },
  },

  navigation: {
    links: [
      { label: "Work", target: "work" },
      { label: "About", target: "about" },
      { label: "Photos", target: "photos" },
      { label: "Contact", target: "contact" },
    ],
    menuFooterLeft: "",
    menuFooterRight: "Mumbai {time} IST",
    labels: { menu: "Menu", close: "Close", toDark: "Dark", toLight: "Light" },
  },

  layout: {
    sections: [
      { section: "hero", visible: true },
      { section: "work", visible: true },
      { section: "about", visible: true },
      { section: "photos", visible: true },
      { section: "contact", visible: true },
    ],
    loader: { enabled: true, caption: "Pranav Koradiya · portfolio ’26" },
  },

  hero: {
    issue: { left: "", center: "", right: "Mumbai {time} IST" },
    masthead: "",
    portraits: [
      portrait("grey-tee", "Pranav smiling, wearing glasses and a grey tee"),
      portrait("mustard-sweater", "Pranav smiling, wearing glasses and a mustard sweater"),
      portrait("white-shirt", "Pranav smiling, wearing glasses and a white shirt"),
      portrait("black-hoodie", "Pranav smiling, wearing glasses and a black hoodie"),
    ],
    coverLines: [],
    currentlyLines: [],
    intro: [],
    scrollHint: "Scroll",
  },

  work: {
    indexLabel: "(01)",
    titleCaps: "Things",
    titleItalic: "I've built",
    subtitle: "",
    labels: {
      view: "View", close: "Close", prev: "Prev", next: "Next", nextProject: "Next project",
      built: "What I built", hardest: "Hardest part", stack: "Tech stack",
      kindImage: "Screen", kindVideo: "Video", kindMobile: "Mobile", kindDiagram: "Diagram",
    },
    projects: [],
  },

  about: {
    indexLabel: "(02)",
    titleCaps: "About",
    titleItalic: "me",
    sideLabel: "",
    lede: [],
    facts: [],
    resumeLabel: "Download resume",
    experienceLabel: "Experience",
    experience: [],
    educationLabel: "Education",
    education: [],
    certificationsLabel: "Certifications",
    certifications: [],
  },

  photos: {
    indexLabel: "(03)",
    titleItalic: "Through",
    titleCaps: "the lens",
    caption: "Shot around Bandra on a Fujifilm X-T30",
    scrollHint: "Keep scrolling",
    swipeHint: "Swipe",
    emptyNote: "Photos coming soon.",
    labels: { view: "View", close: "Close", prev: "Prev", next: "Next" },
    // Stand-in frames so the strip can be built and previewed before real photos exist.
    // Only used when the Photos section document isn't in the dataset; real photos come from the Studio.
    photos: [
      { _id: "photo-1", place: "Bandstand", date: "2026-01-15", exif: { aperture: "f/2.8", shutter: "1/500s", iso: 160, focalLength: "35mm" }, shape: "tall", gradient: "linear-gradient(180deg,#F7B267 0%,#F4845F 45%,#3D405B 46%,#22223B 100%)" },
      { _id: "photo-2", place: "Hill Road", date: "2025-10-15", exif: { aperture: "f/1.4", shutter: "1/60s", iso: 1600, focalLength: "35mm" }, shape: "wide", gradient: "radial-gradient(circle at 30% 40%,#FFD166,#EF476F 60%,#26547C)" },
      { _id: "photo-3", place: "Marine Drive", date: "2025-07-15", exif: { aperture: "f/5.6", shutter: "1/250s", iso: 200, focalLength: "35mm" }, shape: "square", gradient: "linear-gradient(160deg,#9BC1BC 0%,#5D576B 100%)" },
      { _id: "photo-4", place: "Worli Sea Face", date: "2026-03-15", exif: { aperture: "f/8", shutter: "1/1000s", iso: 100, focalLength: "35mm" }, shape: "tall", gradient: "linear-gradient(0deg,#2B2D42 0%,#8D99AE 60%,#EDF2F4 100%)" },
      { _id: "photo-5", place: "Mount Mary steps", date: "2025-12-15", exif: { aperture: "f/2", shutter: "1/125s", iso: 400, focalLength: "35mm" }, shape: "wide", gradient: "linear-gradient(120deg,#C9ADA7,#9A8C98 50%,#4A4E69)" },
      { _id: "photo-6", place: "Carter Road", date: "2025-08-15", exif: { aperture: "f/4", shutter: "1/320s", iso: 200, focalLength: "35mm" }, shape: "square", gradient: "linear-gradient(200deg,#0B3954 0%,#087E8B 50%,#BFD7EA 100%)" },
      { _id: "photo-7", place: "Chapel Road", date: "2025-11-15", exif: { aperture: "f/1.4", shutter: "1/30s", iso: 3200, focalLength: "35mm" }, shape: "tall", gradient: "radial-gradient(circle at 70% 30%,#FFE8D6,#CB997E 55%,#6B705C)" },
      { _id: "photo-8", place: "Bandra Fort", date: "2026-05-15", exif: { aperture: "f/11", shutter: "1/200s", iso: 100, focalLength: "35mm" }, shape: "wide", gradient: "linear-gradient(180deg,#E9C46A,#F4A261 50%,#264653)" },
      { _id: "photo-9", place: "Bandra station", date: "2026-02-15", exif: { aperture: "f/2.8", shutter: "1/60s", iso: 800, focalLength: "35mm" }, shape: "square", gradient: "linear-gradient(90deg,#353535,#3C6E71 50%,#D9D9D9)" },
      { _id: "photo-10", place: "Juhu", date: "2026-04-15", exif: { aperture: "f/5.6", shutter: "1/400s", iso: 160, focalLength: "35mm" }, shape: "tall", gradient: "linear-gradient(200deg,#F2CC8F,#E07A5F 60%,#3D405B)" },
      { _id: "photo-11", place: "Sea Link at night", date: "2025-09-15", exif: { aperture: "f/2", shutter: "1/15s", iso: 6400, focalLength: "35mm" }, shape: "wide", gradient: "linear-gradient(0deg,#1B263B,#415A77 50%,#E0E1DD)" },
      { _id: "photo-12", place: "Joggers Park", date: "2026-06-15", exif: { aperture: "f/4", shutter: "1/250s", iso: 200, focalLength: "35mm" }, shape: "square", gradient: "linear-gradient(140deg,#B5E48C,#52B69A 50%,#184E77)" },
    ],
  },

  contact: {
    indexLabel: "(04)",
    headingCaps: "",
    headingItalic: "",
    labels: {
      email: "Email",
      elsewhere: "Elsewhere",
      locationLine: "",
      replyLine: "{time} IST · usually replies within two days",
      copy: "Copy email",
      copied: "Copied",
      copyFallback: "Selected, press Ctrl+C",
    },
    form: {
      titleLead: "Or leave a note",
      titleItalic: "right here.",
      topicLegend: "What's this about?",
      topics: [],
      nameLabel: "Your name",
      emailLabel: "Email",
      messageLabel: "Message",
      messagePlaceholder: "A line or two is plenty.",
      idleStatus: "Goes straight to Pranav's inbox.",
      sendLabel: "Send note",
      sendingLabel: "Sending…",
      retryLabel: "Try again",
      sendingStatus: "Sending your note…",
      nameError: "Add your name so I know who wrote.",
      emailError: "That email looks off. Check for a typo.",
      messageError: "Write a few words so I know what this is about.",
      successKicker: "Note sent",
      successTitle: "Thanks, {name}.",
      successBody: "I read every note and usually reply within two days.",
      writeAnotherLabel: "Write another",
      errorText: "Couldn't send right now. Check your connection, or email {email} directly.",
    },
    footer: { signature: "", copyright: "", backToTopLabel: "Back to top" },
  },
};
