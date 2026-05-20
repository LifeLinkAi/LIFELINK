/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support local shared workspace transpilation if needed
  transpilePackages: ['shared'],
};

module.exports = nextConfig;
