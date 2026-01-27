// oxlint-disable no-process-env
/** biome-ignore-all lint/style/noProcessEnv: x */

import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'

import { authEnv } from '@a/auth/env'
import { string, enum as zenum, url } from 'zod/v4'

export default createEnv({
  client: {
    NEXT_PUBLIC_CONVEX_URL: url().default('http://127.0.0.1:3210')
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NODE_ENV: process.env.NODE_ENV
  },
  extends: [authEnv(), vercel()],
  server: {
    DB_URL: url(),
    OPENAI_BASE_URL: url(),
    S3_BUCKET: string(),
    S3_ENDPOINT: url()
  },
  shared: {
    NODE_ENV: zenum(['development', 'production', 'test']).default('development')
  },
  skipValidation: Boolean(process.env.CI) || process.env.npm_lifecycle_event === 'lint'
})
