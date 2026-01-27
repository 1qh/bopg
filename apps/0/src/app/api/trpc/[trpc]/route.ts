import type { NextRequest } from 'next/server'

import { router, trpcContext } from '@a/api'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { auth } from '~/auth/server'

const setCorsHeaders = (res: Response) => {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Request-Method', '*')
    res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
    res.headers.set('Access-Control-Allow-Headers', '*')
  },
  OPTIONS = () => {
    const res = new Response(null, { status: 204 })
    setCorsHeaders(res)
    return res
  },
  handler = async (req: NextRequest) => {
    const res = await fetchRequestHandler({
      createContext: async () => trpcContext({ auth, headers: req.headers }),
      endpoint: '/api/trpc',
      onError: ({ error, path }) => console.error(`>>> tRPC Error on '${path}'`, error),
      req,
      router
    })
    setCorsHeaders(res)
    return res
  }

export { handler as GET, OPTIONS, handler as POST }
