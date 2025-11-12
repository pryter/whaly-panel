import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [    {
      protocol: "https",
      hostname: "*", // Allow images from all domains
    },],
  },
  basePath: '/remote',
  assetPrefix: '/remote/',
};

export default nextConfig;
