import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "deifkwefumgah.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dwcavdcrzliyqoavxuna.supabase.co",
        pathname: "/storage/v1/object/public/blog-images/**",
      },
      {
        protocol: "https",
        hostname: "dwcavdcrzliyqoavxuna.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      }
    ],
  },
};

export default nextConfig;
