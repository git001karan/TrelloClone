/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@trello-clone/shared"],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
