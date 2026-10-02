import { defineLive } from "next-sanity/live";
import { client, readToken } from "./client";

/**
 * sanityFetch + <SanityLive />. In draft mode (the Presentation tool) sanityFetch returns drafts and
 * <SanityLive /> pushes edits into the page as they are typed. null until Sanity is configured.
 */
export const live = client
  ? defineLive({ client, serverToken: readToken ?? false, browserToken: readToken ?? false })
  : null;
