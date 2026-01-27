// oxlint-disable no-process-env
/** biome-ignore-all lint/style/noProcessEnv: x */

import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'

import { authEnv } from '@a/auth/env'
import { url, string, enum as zenum } from 'zod/v4'

export default createEnv({
  client: {},
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV
  },
  extends: [authEnv(), vercel()],
  server: {
    DB_URL: url(),
    FASTAPI_URL: url(),
    OLLAMA_URL: url(),
    OPENAI_BASE_URL: url(),
    OPENID_CLIENT_ID: string(),
    OPENID_CLIENT_SECRET: string(),
    S3_ACCESS_KEY_ID: string(),
    S3_BUCKET: string(),
    S3_ENDPOINT: url(),
    S3_SECRET_ACCESS_KEY: string(),
    SERPER_API_KEY: string()
  },
  shared: {
    NODE_ENV: zenum(['development', 'production', 'test']).default('development')
  },
  skipValidation: Boolean(process.env.CI) || process.env.npm_lifecycle_event === 'lint'
})
