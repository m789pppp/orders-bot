import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow catalog photo uploads from the dashboard (Vercel caps request bodies at ~4.5 MB).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
