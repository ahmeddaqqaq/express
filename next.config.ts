import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lionsinternationalco.com",
        pathname: "/express/images/**",
      },
    ],
  },
};

export default nextConfig;
