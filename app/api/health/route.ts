import { NextResponse } from "next/server";
import { getProviderStatus } from "@/lib/llm";
import { vectorCacheAvailable } from "@/lib/cache/semantic-cache-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds)}s`,
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "0.1.0",
    system: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
    services: {
      supabase: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "unconfigured",
      persistentSemanticCache: vectorCacheAvailable() ? "configured" : "unconfigured",
    },
    llmProviders: getProviderStatus(),
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
