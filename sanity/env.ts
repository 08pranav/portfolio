/** Sanity connection settings. Everything is optional: with no project ID the site renders from content/defaults.ts. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-10-01";
export const studioBasePath = "/admin";
export const isSanityConfigured = projectId.length > 0;
