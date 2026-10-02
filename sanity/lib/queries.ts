import { defineQuery } from "next-sanity";

const IMG = `{ "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip, "hotspot": hotspot{x, y}, alt }`;

const PROJECT = `{
  _id, "updatedAt": _updatedAt, "slug": slug.current, year, title, urlLabel, description, built, hardest, stack, note,
  "links": links[]{label, url},
  "theme": { "background": themeBackground, "text": themeText },
  archLabels,
  "seo": seo{ metaTitle, metaDescription, "shareImage": shareImage${IMG} },
  "media": media[]{
    type, caption, mock, duration,
    "image": image${IMG},
    "videoUrl": coalesce(videoFile.asset->url, videoUrl),
    "poster": poster${IMG}
  }
}`;

/** One request for the whole page. Every document type from ADMIN.md. */
export const CONTENT_QUERY = defineQuery(`{
  "updatedAt": *[_type in ["siteSettings", "hero", "homepageLayout", "workSection", "aboutSection", "photosSection", "contactSection", "project", "photo"]] | order(_updatedAt desc)[0]._updatedAt,
  "site": *[_type == "siteSettings"][0]{
    fullName, logoText, email, location, timeZone,
    status{ openToWork, shortText, text },
    "socials": socials[]{ platform, url, label },
    "resume": { "url": resume.file.asset->url, "updatedAt": resume.updatedAt, "pages": resume.pages },
    defaultTheme,
    errorPages,
    "seo": { "title": seo.title, "titleTemplate": seo.titleTemplate, "description": seo.description, "keywords": seo.keywords, "canonicalDomain": seo.canonicalDomain, "jobTitle": seo.jobTitle, "alumniOf": seo.alumniOf, "addressLocality": seo.addressLocality, "addressCountry": seo.addressCountry, "shareImage": seo.shareImage${IMG}, "favicon": seo.favicon${IMG} }
  },
  "navigation": *[_type == "navigation"][0]{
    "links": links[]{ label, target }, menuFooterLeft, menuFooterRight, labels
  },
  "layout": *[_type == "homepageLayout"][0]{
    "sections": sections[]{ section, "visible": coalesce(visible, true) },
    loader
  },
  "hero": *[_type == "hero"][0]{
    issue, masthead,
    "portraits": portraits[]{ "url": image.asset->url, "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height, alt },
    "coverLines": coverLines[]{ label, bigNumber, textSource, text, linkLabel, linkTarget },
    currentlyLines, intro, scrollHint
  },
  "work": *[_type == "workSection"][0]{
    indexLabel, titleCaps, titleItalic, subtitle, labels,
    "projects": select(
      count(projects) > 0 => projects[@->isHidden != true]->${PROJECT},
      *[_type == "project" && isHidden != true] | order(year desc, title asc)${PROJECT}
    )
  },
  "about": *[_type == "aboutSection"][0]{
    indexLabel, titleCaps, titleItalic, sideLabel, lede, "facts": facts[]{ label, value }, resumeLabel,
    experienceLabel, "experience": experience[]{ when, role, org, text },
    educationLabel, "education": education[]{ when, title, org, note },
    certificationsLabel, certifications
  },
  "photos": *[_type == "photosSection"][0]{
    indexLabel, titleItalic, titleCaps, caption, scrollHint, swipeHint, emptyNote, labels,
    "photos": *[_type == "photo" && isHidden != true] | order(orderRank){
      _id, "image": image${IMG}, place, date, exif, shape
    }
  },
  "contact": *[_type == "contactSection"][0]{
    indexLabel, headingCaps, headingItalic, labels,
    form{ ..., "topics": topics[]{ label, value } },
    footer
  }
}`);
