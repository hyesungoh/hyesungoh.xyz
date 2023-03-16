/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['core'],
  compress: true,
  swcMinify: true,
};

module.exports = nextConfig;
