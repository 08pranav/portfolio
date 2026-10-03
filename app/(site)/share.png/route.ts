/** The old address of the share image. Previews that cached it keep working. */
export function GET(request: Request) {
  return Response.redirect(new URL("/share.jpg", request.url), 308);
}
