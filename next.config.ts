import type { NextConfig } from "next";
import path from "node:path";

const sanityProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // the round logo Next shows in the corner while developing
  devIndicators: false,
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    // images uploaded in the Studio come from the image CDN, limited to this project's files
    remotePatterns: sanityProject
      ? [{ protocol: "https", hostname: "cdn.sanity.io", pathname: `/images/${sanityProject}/**` }]
      : [],
  },
  // lets app/global-not-found.tsx style the 404 for addresses that match no route
  experimental: { globalNotFound: true },
  // the admin panel and the API are never indexed or followed
  async headers() {
    return [
      { source: "/admin", headers: noindex },
      { source: "/admin/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
    ];
  },
  // A stray lockfile exists in the home directory; pin the root to this project.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
