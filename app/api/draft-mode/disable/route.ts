import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  (await draftMode()).disable();
  const target = new URL(request.url).searchParams.get("redirect") ?? "/";
  // only ever redirect to a path on this site
  const safe = target.startsWith("/") && !target.startsWith("//") ? target : "/";
  return NextResponse.redirect(new URL(safe, request.url));
}
