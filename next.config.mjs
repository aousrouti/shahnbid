/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // web-push uses Node crypto; keep it out of the bundler.
    serverComponentsExternalPackages: ['web-push'],
  },
};

export default nextConfig;
