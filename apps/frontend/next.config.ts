import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@everleap/design-system"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://34.14.169.188:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
