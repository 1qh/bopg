// oxlint-disable group-exports
import { createNEMO } from '@rescale/nemo'
import { getSessionCookie } from 'better-auth/cookies'
import { headers } from 'next/headers'
import { NextResponse as R } from 'next/server'

export const proxy = createNEMO(
  {
    '/(login|annot|ollama)/:path*': [
      req => {
        const ck = getSessionCookie(req),
          { pathname } = req.nextUrl
        if (!(ck || pathname.startsWith('/login'))) return R.redirect(new URL('/login', req.url))
        if (ck && pathname.startsWith('/login')) return R.redirect(new URL('/', req.url))
      }
    ]
  },
  {
    before: async req => {
      const h = new Headers(await headers())
      h.set('x-pathname', req.nextUrl.pathname)
      return R.next({ headers: h })
    }
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
