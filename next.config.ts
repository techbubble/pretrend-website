import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async redirects() {
    return [{ source: '/trendplay', destination: '/market/aiwars', permanent: true }];
  },
};

export default nextConfig;
