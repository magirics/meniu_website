import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  turbopack: {},

  env: {
    NEXT_PUBLIC_AWS_REGION: 'sa-east-1',
    AMZ_ACCESS_KEY_ID: 'AKIARSU7K3WRW343JHJW',
    AMZ_SECRET_ACCESS_KEY: '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'
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui.shadcn.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Headers for better security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  // Redirects for better SEO
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/landing",
      },
    ]
  },
}

export default nextConfig
