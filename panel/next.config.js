/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack filesystem cache in development to prevent corrupted segment caching (e.g. ./370.js module not found)
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig
