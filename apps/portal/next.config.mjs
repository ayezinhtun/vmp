/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverComponentsExternalPackages: ['socket.io-client'] },
  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${process.env.API_INTERNAL_URL ?? 'http://localhost:4000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
