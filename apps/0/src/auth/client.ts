import { ssoClient } from '@better-auth/sso/client'
import { magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export default createAuthClient({
  plugins: [magicLinkClient(), ssoClient()]
})
