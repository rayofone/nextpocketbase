import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Keep this app rooted here; a parent package-lock.json exists above the repo.
    root: path.join(__dirname),
  },
};

export default nextConfig;
