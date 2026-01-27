import { exportJWK, exportPKCS8, generateKeyPair } from 'jose'
import { log } from 'node:console'
const keys = await generateKeyPair('RS256', { extractable: true }),
  privateKey = await exportPKCS8(keys.privateKey),
  publicKey = await exportJWK(keys.publicKey),
  jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicKey }] })

log(`JWT_PRIVATE_KEY="${privateKey.trimEnd().replaceAll('\n', ' ')}"`)
log(`JWKS=${jwks}`)
