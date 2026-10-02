import type { PortableTextBlock } from "@portabletext/react";

/** What the site components consume. GROQ projections in queries.ts produce exactly these shapes. */

export type ImageRef = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Blur placeholder (Sanity LQIP). */
  lqip?: string;
  /** Hotspot centre, 0 to 1. */
  hotspot?: { x: number; y: number };
};

export type RichText = PortableTextBlock[];

export type SectionKey = "hero" | "work" | "about" | "photos" | "contact";
/** Anchor target: "top" or a section id. */
export type SectionTarget = "top" | "work" | "about" | "photos" | "contact";

export type SocialPlatform =
  | "GitHub" | "LinkedIn" | "Instagram" | "Pinterest" | "X" | "Behance" | "Dribbble" | "YouTube" | "Other";

export type SiteSettings = {
  fullName: string;
  logoText: string;
  email: string;
  location: string;
  timeZone: string;
  status: { openToWork: boolean; shortText: string; text: string };
  socials: { platform: SocialPlatform; url: string; label?: string }[];
  resume: { url?: string; updatedAt?: string; pages?: number };
  defaultTheme: "system" | "light" | "dark";
  errorPages: { notFoundTitle: string; notFoundBody: string; errorTitle: string; errorBody: string; homeLabel: string; retryLabel: string };
  seo: {
    title: string;
    titleTemplate: string;
    description: string;
    keywords: string[];
    /** e.g. https://pranavkoradiya.com, empty until a domain is set. */
    canonicalDomain?: string;
    shareImage?: ImageRef;
    favicon?: ImageRef;
    jobTitle: string;
    alumniOf: string;
    addressLocality: string;
    addressCountry: string;
  };
};

export type Navigation = {
  links: { label: string; target: SectionTarget }[];
  menuFooterLeft: string;
  menuFooterRight: string;
  labels: { menu: string; close: string; toDark: string; toLight: string };
};

export type HomepageLayout = {
  sections: { section: SectionKey; visible: boolean }[];
  loader: { enabled: boolean; caption: string };
};

export type CoverLine = {
  label: string;
  bigNumber?: string;
  textSource: "custom" | "status" | "currently";
  text?: string;
  linkLabel: string;
  linkTarget: SectionTarget;
};

export type Hero = {
  issue: { left: string; center: string; right: string };
  masthead: string;
  portraits: ImageRef[];
  coverLines: CoverLine[];
  currentlyLines: string[];
  intro: RichText;
  scrollHint: string;
};

export type MediaItem = {
  type: "image" | "videoFile" | "videoUrl" | "mobile" | "diagram";
  /** Uploaded image (image, mobile and diagram types). */
  image?: ImageRef;
  /** Uploaded video file URL, or an external video URL. */
  videoUrl?: string;
  poster?: ImageRef;
  caption: string;
  /** Stand-in layout when no file is attached. */
  mock?: "home" | "dash" | "list";
  /** Stand-in video length, e.g. "0:42". */
  duration?: string;
};

export type Project = {
  _id: string;
  /** ISO timestamp of the last edit, used for the sitemap. */
  updatedAt?: string;
  seo?: { metaTitle?: string; metaDescription?: string; shareImage?: ImageRef };
  slug: string;
  year: string;
  title: string;
  urlLabel: string;
  description: string;
  built: string;
  hardest: string;
  stack: string[];
  links: { label: string; url: string }[];
  /** Optional small print beside the links. */
  note?: string;
  theme: { background: string; text: string };
  /** Stand-in architecture diagram labels: client, api, data. */
  archLabels?: string[];
  media: MediaItem[];
};

export type WorkSection = {
  indexLabel: string;
  titleCaps: string;
  titleItalic: string;
  subtitle: string;
  labels: {
    view: string; close: string; prev: string; next: string; nextProject: string;
    built: string; hardest: string; stack: string;
    kindImage: string; kindVideo: string; kindMobile: string; kindDiagram: string;
  };
  projects: Project[];
};

export type AboutSection = {
  indexLabel: string;
  titleCaps: string;
  titleItalic: string;
  sideLabel: string;
  lede: RichText;
  facts: { label: string; value: string }[];
  resumeLabel: string;
  experienceLabel?: string;
  experience: { when: string; role: string; org: string; text?: string }[];
  educationLabel?: string;
  education: { when: string; title: string; org: string; note?: string }[];
  certificationsLabel?: string;
  certifications: string[];
};

export type Photo = {
  _id: string;
  image?: ImageRef;
  place: string;
  /** ISO date, shown as "Jan 2026". */
  date: string;
  exif: { aperture?: string; shutter?: string; iso?: number; focalLength?: string };
  shape: "tall" | "wide" | "square";
  /** Stand-in gradient, only used by the built-in defaults. */
  gradient?: string;
};

export type PhotosSection = {
  indexLabel: string;
  titleItalic: string;
  titleCaps: string;
  caption: string;
  scrollHint: string;
  swipeHint: string;
  labels: { view: string; close: string; prev: string; next: string };
  photos: Photo[];
};

export type ContactSection = {
  indexLabel: string;
  headingCaps: string;
  headingItalic: string;
  labels: {
    email: string; elsewhere: string; locationLine: string; replyLine: string;
    copy: string; copied: string; copyFallback: string;
  };
  form: {
    titleLead: string; titleItalic: string; topicLegend: string;
    topics: { label: string; value: string }[];
    nameLabel: string; emailLabel: string; messageLabel: string; messagePlaceholder: string;
    idleStatus: string; sendLabel: string; sendingLabel: string; retryLabel: string; sendingStatus: string;
    nameError: string; emailError: string; messageError: string;
    successKicker: string; successTitle: string; successBody: string; writeAnotherLabel: string;
    errorText: string;
  };
  footer: { signature: string; copyright: string; backToTopLabel: string };
};

export type SiteContent = {
  /** ISO timestamp of the most recent edit anywhere on the site. */
  updatedAt?: string;
  site: SiteSettings;
  navigation: Navigation;
  layout: HomepageLayout;
  hero: Hero;
  work: WorkSection;
  about: AboutSection;
  photos: PhotosSection;
  contact: ContactSection;
};
