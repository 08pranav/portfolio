import { InboxIcon } from "@sanity/icons/Inbox";
import { defineField, defineType } from "sanity";

/** Notes sent through the contact form. Written by the site, never by hand. */
export default defineType({
  name: "inboxNote",
  title: "Note",
  type: "document",
  icon: InboxIcon,
  readOnly: true,
  fields: [
    defineField({ name: "name", title: "Name", type: "string", description: "Who wrote the note." }),
    defineField({ name: "email", title: "Email", type: "string", description: "Where to reply." }),
    defineField({ name: "topic", title: "Topic", type: "string", description: "What the visitor said it was about." }),
    defineField({ name: "message", title: "Message", type: "text", description: "The note itself." }),
    defineField({ name: "receivedAt", title: "Received", type: "datetime", description: "When the note arrived." }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "receivedAt", direction: "desc" }] }],
  preview: {
    select: { title: "name", subtitle: "topic", description: "message" },
    prepare: ({ title, subtitle, description }) => ({ title: title ?? "Unknown", subtitle, description }),
  },
});
