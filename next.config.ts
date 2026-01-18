import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.slack-edge.com", // Allow Slack avatars
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com", // Allow Gravatar
      },
      {
        protocol: "https",
        hostname: "*.slack-edge.com"
      }
    ],
  },
};

export default nextConfig;
