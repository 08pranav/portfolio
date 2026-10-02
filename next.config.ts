import type { NextConfig } from "next";
import path from "node:path";

const sanityProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    // images uploaded in the Studio come from Sanity's CDN, limited to this project's files
    remotePatterns: sanityProject
      ? [{ protocol: "https", hostname: "cdn.sanity.io", pathname: `/images/${sanityProject}/**` }]
      : [],
  },
  // A stray lockfile exists in the home directory; pin the root to this project.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
