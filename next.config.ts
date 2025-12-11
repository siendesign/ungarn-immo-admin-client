import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jzhlioxxjwqwvwybtcfl.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
