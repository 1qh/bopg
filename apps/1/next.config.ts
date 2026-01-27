import type { NextConfig } from 'next'

const config: NextConfig = {
  cacheComponents: true,
  experimental: { serverActions: { bodySizeLimit: '100mb' } },
  images: { remotePatterns: [{ hostname: '*' }] },
  reactCompiler: true,
  transpilePackages: ['@a/api', '@a/auth', '@a/db', '@a/ui'],
  typescript: { ignoreBuildErrors: true }
}

export default config
