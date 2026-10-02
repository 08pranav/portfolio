import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client, readToken } from "@/sanity/lib/client";

const handler = client && readToken ? defineEnableDraftMode({ client: client.withConfig({ token: readToken }) }) : null;

/** Called by the Studio's Presentation tool to switch the site into draft (live preview) mode. */
export async function GET(request: Request) {
  if (!handler) {
    return new Response("Live preview needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_READ_TOKEN in .env.local.", { status: 503 });
  }
  return handler.GET(request);
}
