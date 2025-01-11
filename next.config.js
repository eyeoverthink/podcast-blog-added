/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery'
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery'
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/local-files/:type/:filename',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig
