# Pranav Koradiya: portfolio

This is my personal portfolio: an editorial, magazine-cover style site for my projects, résumé, photography and contact details. I'm a third-year Computer Engineering student at Fr. CRCE in Mumbai, and I built the site to look and feel like a printed cover, with a condensed masthead, a portrait that changes outfit when you click it, and a pinned horizontal strip for photos.

Everything you read on the page, every image, list and link, is edited in an admin panel at `/admin`. Nothing is hard-coded in the components.

## Stack

- **Next.js** (App Router) and TypeScript
- **Sanity** for content, with the Studio embedded at `/admin` and live preview through the Presentation tool
- **GSAP** (with ScrollTrigger) for animation and **Lenis** for smooth scrolling
- Plain CSS with design tokens and CSS Modules, no UI framework
- **Web3Forms** for the contact form
- Deployed on **Vercel**

## Run it locally

```bash
npm install
# create .env.local and add the variables listed below
npm run dev
```

Then open http://localhost:3000, and http://localhost:3000/admin for the admin panel.

Other scripts:

```bash
npm run lint           # ESLint
npm run build          # production build
npm run check:schema   # validates the Sanity schemas
npm run check:query    # runs the content query against sample documents
npm run check:jsonld   # checks the structured data on every page against schema.org (needs the site running)
```

## Environment variables

Names only; set the values in `.env.local` and in the Vercel project settings.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project to read from |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (usually `production`) |
| `SANITY_API_READ_TOKEN` | Live preview of unpublished drafts |
| `SANITY_API_WRITE_TOKEN` | Optional: saving contact notes to the admin inbox |
| `SANITY_REVALIDATE_SECRET` | Verifies the Sanity webhook at `/api/revalidate` |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Sends contact form notes to my email |
| `NEXT_PUBLIC_SITE_URL` | Optional: fallback public address; the main domain set in the admin takes priority |

With no Sanity project configured the site still builds and renders its built-in skeleton.
