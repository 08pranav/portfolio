/** Web3Forms: the contact form posts straight from the browser using the public access key. */
const ENDPOINT = "https://api.web3forms.com/submit";

export type Note = { name: string; email: string; topic: string; message: string };

export class NoteError extends Error {}

export async function sendNote(note: Note) {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) throw new NoteError("NEXT_PUBLIC_WEB3FORMS_KEY is not set");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `Portfolio note: ${note.topic} from ${note.name}`,
      from_name: "Portfolio",
      replyto: note.email,
      name: note.name,
      email: note.email,
      topic: note.topic,
      message: note.message,
      botcheck: "",
    }),
  });
  const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
  if (!res.ok || !json?.success) throw new NoteError(json?.message ?? `Web3Forms responded ${res.status}`);

  // Optional second copy in the Studio's Inbox. Never blocks or fails the visitor's note.
  fetch("/api/inbox", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...note, botcheck: "" }),
    keepalive: true,
  }).catch(() => {});
}
