// oxlint-disable no-process-env
/** biome-ignore-all lint/style/noProcessEnv: x */

import { createEnv } from '@t3-oss/env-core'
import { string } from 'zod/v4'

const env = createEnv({
    server: {
      AUTH_GOOGLE_ID: string().min(1),
      AUTH_GOOGLE_SECRET: string().min(1),
      AUTH_SENDGRID_KEY: string().min(1),
      RESEND_API_KEY: string().min(1)
    },
    runtimeEnv: process.env,
    skipValidation: Boolean(process.env.CI) || process.env.npm_lifecycle_event === 'lint'
  }),
  authEnv = () => env

export { env, authEnv }
