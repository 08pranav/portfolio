import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ImageIcon } from "@sanity/icons/Image";
import { ImagesIcon } from "@sanity/icons/Images";
import { InboxIcon } from "@sanity/icons/Inbox";
import { MenuIcon } from "@sanity/icons/Menu";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { UserIcon } from "@sanity/icons/User";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { ComponentType } from "react";
import type { StructureResolver } from "sanity/structure";

/** Sidebar, in the order from ADMIN.md. Singletons open straight into the document. */
export const structure: StructureResolver = (S, context) => {
  const single = (type: string, title: string, icon: ComponentType) =>
    S.listItem()
      .id(type)
      .title(title)
      .icon(icon)
      .child(S.document().schemaType(type).documentId(type).title(title));

  return S.list()
    .title("Content")
    .items([
      single("siteSettings", "Site settings", CogIcon),
      single("navigation", "Navigation", MenuIcon),
      single("homepageLayout", "Homepage layout", ThLargeIcon),
      single("hero", "Hero", SparklesIcon),
      S.listItem()
        .id("work")
        .title("Work")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Work")
            .items([
              single("workSection", "Work section", CogIcon),
              S.listItem()
                .id("projects")
                .title("Projects")
                .icon(CaseIcon)
                .child(S.documentTypeList("project").title("Projects")),
            ]),
        ),
      single("aboutSection", "About section", UserIcon),
      S.listItem()
        .id("photos")
        .title("Photos")
        .icon(ImagesIcon)
        .child(
          S.list()
            .title("Photos")
            .items([
              single("photosSection", "Photos section", CogIcon),
              orderableDocumentListDeskItem({ type: "photo", title: "Photos", icon: ImageIcon, S, context }),
            ]),
        ),
      single("contactSection", "Contact section", EnvelopeIcon),
      S.listItem()
        .id("inbox")
        .title("Inbox")
        .icon(InboxIcon)
        .child(S.documentTypeList("inboxNote").title("Inbox").defaultOrdering([{ field: "receivedAt", direction: "desc" }])),
    ]);
};
