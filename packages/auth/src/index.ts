import NextAuth from 'next-auth'

import { authConfig } from './config'

export { invalidateSessionToken, isSecureContext, validateToken } from './config'

const { auth, handlers, signIn, signOut } = NextAuth(authConfig)

export { auth, handlers, signIn, signOut }

export type { Session } from 'next-auth'
