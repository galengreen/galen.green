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
}

export default withPayload(nextConfig)
