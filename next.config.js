/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['veriphy.app', 'localhost:3000'] }
  },
  images: {
    domains: ['veriphy.app']
  }
}
module.exports = nextConfig
