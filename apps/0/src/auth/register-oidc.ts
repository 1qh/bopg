import env from '~/env'

import { auth } from './server'

const setupKeycloakProvider = async () => {
  try {
    const { headers } = await auth.api.signUpEmail({
        body: { email: 'x@x.xx', name: 'x', password: 'x' },
        returnHeaders: true
      }),
      cookie = headers.get('set-cookie') ?? ''
    await auth.api.registerSSOProvider({
      body: {
        domain: 'ok.com',
        issuer: 'https://id-test.ok.com/auth/realms/hello',
        oidcConfig: {
          authorizationEndpoint: 'https://id-test.ok.com/auth/realms/hello/protocol/openid-connect/auth',
          clientId: env.OPENID_CLIENT_ID,
          clientSecret: env.OPENID_CLIENT_SECRET,
          discoveryEndpoint: 'https://id-test.ok.com/auth/realms/hello/.well-known/openid-configuration',
          jwksEndpoint: 'https://id-test.ok.com/auth/realms/hello/protocol/openid-connect/certs',
          mapping: {
            email: 'email',
            emailVerified: 'email_verified',
            id: 'sub',
            image: 'picture',
            name: 'name'
          },
          pkce: true,
          scopes: ['openid', 'email', 'profile'],
          tokenEndpoint: 'https://id-test.ok.com/auth/realms/hello/protocol/openid-connect/token'
        },
        providerId: 'keycloak-ok'
      },
      headers: { cookie }
    })
    console.log('SSO Provider registered successfully!')
  } catch (error) {
    console.error('Failed to register SSO provider:', error)
  }
}

await setupKeycloakProvider()
process.exit(0)
