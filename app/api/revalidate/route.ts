import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CONTENT_TAG } from "@/sanity/lib/content";

/**
 * Sanity webhook target: expires the cached site content the moment something is published, so edits show up
 * within a second or two even when nobody is on the site. Set up in sanity.io/manage -> API -> Webhooks
 * (see the Setup section of ADMIN.md). Requests must carry Sanity's signature, made with SANITY_REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });

  const { isValidSignature } = await parseBody(request, secret, true);
  if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag: CONTENT_TAG, at: new Date().toISOString() });
}
