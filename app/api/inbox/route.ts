import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";
import { writeToken } from "@/sanity/lib/client";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Stores a contact-form note in the Studio's Inbox. The browser still sends the email through Web3Forms;
 * this is the optional second copy. Does nothing (and says so) until SANITY_API_WRITE_TOKEN is set.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });
  if (body.botcheck) return Response.json({ stored: false }); // honeypot: pretend it worked

  const name = clip(body.name, 80);
  const email = clip(body.email, 120);
  const message = clip(body.message, 2000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 5) {
    return Response.json({ error: "Invalid note" }, { status: 422 });
  }

  if (!isSanityConfigured || !writeToken) return Response.json({ stored: false, reason: "inbox not configured" });

  const write = createClient({ projectId, dataset, apiVersion, token: writeToken, useCdn: false });
  await write.create({
    _type: "inboxNote",
    name,
    email,
    topic: clip(body.topic, 40),
    message,
    receivedAt: new Date().toISOString(),
  });
  return Response.json({ stored: true });
}
