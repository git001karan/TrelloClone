/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@trello-clone/shared"],
  typescript: {
    // Allow build to complete even with type warnings from workspace packages
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
