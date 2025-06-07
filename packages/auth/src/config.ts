import type { DefaultSession, NextAuthConfig, Session as NextAuthSession } from 'next-auth'

import { db } from '@a/db/client'
import { Account, Session, User } from '@a/db/schema'
import { skipCSRFCheck } from '@auth/core'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Google from 'next-auth/providers/google'

import { env } from '../env'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
    }
  }
}

const adapter = DrizzleAdapter(db, {
  accountsTable: Account,
  sessionsTable: Session,
  usersTable: User
})

export const isSecureContext = env.NODE_ENV !== 'development'

export const authConfig = {
  adapter,
  trustHost: true,
  ...(isSecureContext ? {} : { skipCSRFCheck }),
  callbacks: {
    session: opts => {
      if (!('user' in opts)) throw new Error('unreachable with session strategy')
      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id
        }
      }
    }
  },
  providers: [Google],
  secret: env.AUTH_SECRET
} as NextAuthConfig

export const validateToken = async (token: string): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice('Bearer '.length),
    session = await adapter.getSessionAndUser?.(sessionToken)
  return session
    ? {
        expires: session.session.expires.toISOString(),
        user: {
          ...session.user
        }
      }
    : null
}

export const invalidateSessionToken = async (token: string) => {
  const sessionToken = token.slice('Bearer '.length)
  await adapter.deleteSession?.(sessionToken)
}
