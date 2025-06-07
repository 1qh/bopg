import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod/v4'

import { env as authEnv } from '@a/auth/env'

export const env = createEnv({
  client: {},
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV
  },
  extends: [authEnv, vercel()],
  server: {
    DB_URL: z.url()
  },
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint'
})
