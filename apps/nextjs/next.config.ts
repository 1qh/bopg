import type { NextConfig } from 'next'

const config: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@a/api', '@a/auth', '@a/db', '@a/ui'],
  images: { remotePatterns: [{ hostname: '*' }] },
  typescript: { ignoreBuildErrors: true }
}

export default config
