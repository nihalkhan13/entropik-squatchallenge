import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/plank',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
