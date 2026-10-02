/** Shape of content/seed.json (a local, unpublished file with your résumé details). */
export type Seed = {
  site: {
    name: string; logo: string; email: string; location: string; timeZone: string;
    openToWork: boolean; statusText: string;
    socials: { platform: string; url: string }[];
    resume: string;
  };
  hero: {
    issue: string[]; masthead: string; portraits: string[];
    covers: { label: string; number?: string; text: string; link: string; target: string }[];
    currently: string[]; intro: string;
  };
  about: {
    lede: string; facts: string[][];
    experience: { when: string; role: string; org: string; text: string }[];
    education: { when: string; title: string; org: string; note: string }[];
    certifications: string[];
  };
  projects: {
    title: string; year: string; urlLabel: string; description: string; built: string; hardest: string;
    stack: string[]; links: { label: string; url: string }[]; note: string | null;
    accent: { bg: string; fg: string }; architecture: string[];
    media: { kind: string; caption: string; src: string | null }[];
  }[];
  photos: unknown;
  contact: { heading: string[]; topics: string[]; footerSignature: string; copyright: string };
};
