import NextAuth from 'next-auth'
import { cache } from 'react'

import { authConfig } from './config'

export { invalidateSessionToken, isSecureContext, validateToken } from './config'

const { auth: defaultAuth, handlers, signIn, signOut } = NextAuth(authConfig),
  auth = cache(defaultAuth)

export { auth, handlers, signIn, signOut }

export type { Session } from 'next-auth'
