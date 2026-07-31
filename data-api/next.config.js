/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@hookform/resolvers'],
  },
};

module.exports = nextConfig;
