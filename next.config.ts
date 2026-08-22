import type { NextConfig } from "next";

const isDockerBuild = process.env.DOCKER_BUILD === "true" || process.env.STANDALONE === "true";

const nextConfig: NextConfig = {
  ...(isDockerBuild ? { output: "standalone" } : {}),
  experimental: {
    // Tree-shake large packages so only used exports are bundled
    optimizePackageImports: ["lucide-react", "framer-motion", "@supabase/supabase-js"],
  },
};

export default nextConfig;
