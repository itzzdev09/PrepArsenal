import type { NextConfig } from "next";

const isDockerBuild = process.env.DOCKER_BUILD === "true" || process.env.STANDALONE === "true";

const nextConfig: NextConfig = {
  ...(isDockerBuild ? { output: "standalone" } : {}),
  serverExternalPackages: ["ioredis"],
  experimental: {
    // Tree-shake large packages so only used exports are bundled
    optimizePackageImports: ["framer-motion", "@supabase/supabase-js"],
  },
};

export default nextConfig;
