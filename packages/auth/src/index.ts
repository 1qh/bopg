/* eslint-disable new-cap */
import type { BetterAuthOptions } from 'better-auth'

import db from '@a/db/client'
import { sso } from '@better-auth/sso'
import { render } from '@react-email/components'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { anonymous, magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { sleep } from 'utils'

import { env } from '../env'
import Login from './login'
import ResetPass from './reset-pass'
import sg from './sg'

const resend = new Resend(env.RESEND_API_KEY),
  from = 'onboarding@resend.dev'

type Auth = ReturnType<typeof initAuth>
type Session = Auth['$Infer']['Session']

const initAuth = () =>
  betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: {
      autoSignIn: true,
      enabled: true,
      minPasswordLength: 1,
      sendResetPassword: async ({ url, user: { email } }) => {
        await sg.send({
          from,
          html: await render(ResetPass({ email, url })),
          subject: 'Reset your password',
          to: email
        })
      }
    },
    onAPIError: {
      onError: (error, ctx) => {
        console.error('BETTER AUTH API ERROR', error, ctx)
      }
    },
    plugins: [
      anonymous({ disableDeleteAnonymousUser: true }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await resend.emails.send({
            from,
            react: Login({ email, url }),
            subject: 'Your magic link',
            to: email
          })
        }
      }),
      sso({
        provisionUser: async data => {
          await sleep(1)
          console.log('Sign in with SSO:', data)
        }
      }),
      nextCookies()
    ],
    socialProviders: {
      google: {
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET
      }
    },
    trustedOrigins: ['*']
  } satisfies BetterAuthOptions)

export { initAuth }
export type { Auth, Session }
