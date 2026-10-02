/**
 * The public address of the site, used to turn "/share.png" into the absolute URL that link previews need.
 * Set NEXT_PUBLIC_SITE_URL to the custom domain (e.g. https://pranavkoradiya.com); otherwise the production
 * address Vercel provides is used, and localhost in development.
 */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return "http://localhost:3000";
}
