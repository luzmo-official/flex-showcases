/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.STATIC_EXPORT === '1' ? 'export' : undefined,
  basePath: process.env.STATIC_EXPORT === '1' ? '/guided-chart-creator' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  devIndicators: false,
}

export default nextConfig