import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    reactCompiler: false,
  },
  // Allow dev access from local network
  allowedDevOrigins: ['http://192.168.0.69:3000'],
  // Turbopack config to set correct root
  turbopack: {
    root: process.cwd(),
  },
  // Allow cross-origin media loading in development
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
