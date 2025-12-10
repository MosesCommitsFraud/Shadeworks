import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@xenova/transformers'],
  turbopack: {},
};

export default nextConfig;
