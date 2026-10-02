import type { SchemaTypeDefinition } from "sanity";
import {
  aboutSectionDoc,
  contactSectionDoc,
  heroDoc,
  homepageLayoutDoc,
  navigationDoc,
  photosSectionDoc,
  siteSettingsDoc,
  workSectionDoc,
} from "../lib/documents";
import aboutSection from "./documents/aboutSection";
import contactSection from "./documents/contactSection";
import hero from "./documents/hero";
import homepageLayout from "./documents/homepageLayout";
import inboxNote from "./documents/inboxNote";
import navigation from "./documents/navigation";
import photo from "./documents/photo";
import photosSection from "./documents/photosSection";
import project from "./documents/project";
import siteSettings from "./documents/siteSettings";
import workSection from "./documents/workSection";
import imageWithAlt from "./objects/imageWithAlt";
import italicText from "./objects/italicText";
import mediaItem from "./objects/mediaItem";
import portrait from "./objects/portrait";

/** Singletons start pre-filled with the prototype's content. */
const initialValues: Record<string, () => unknown> = {
  siteSettings: siteSettingsDoc,
  navigation: navigationDoc,
  homepageLayout: homepageLayoutDoc,
  hero: heroDoc,
  workSection: () => workSectionDoc(),
  aboutSection: aboutSectionDoc,
  photosSection: photosSectionDoc,
  contactSection: contactSectionDoc,
};

const withInitialValue = (type: SchemaTypeDefinition): SchemaTypeDefinition => {
  const make = initialValues[type.name];
  if (!make) return type;
  return {
    ...type,
    initialValue: () => {
      const { _type, ...rest } = make() as Record<string, unknown>;
      void _type;
      return rest;
    },
  } as SchemaTypeDefinition;
};

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  navigation,
  homepageLayout,
  hero,
  workSection,
  project,
  aboutSection,
  photosSection,
  photo,
  contactSection,
  inboxNote,
  imageWithAlt,
  italicText,
  mediaItem,
  portrait,
].map(withInitialValue);
