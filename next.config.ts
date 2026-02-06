import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@met4citizen/talkinghead', 'three'],
  serverExternalPackages: ['@anthropic-ai/sdk'],
};

export default nextConfig;
