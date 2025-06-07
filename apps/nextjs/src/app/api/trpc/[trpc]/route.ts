import { createTRPCContext, router } from '@a/api'
import { auth } from '@a/auth'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const setCorsHeaders = (res: Response) => {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
  res.headers.set('Access-Control-Allow-Headers', '*')
}

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 })
  setCorsHeaders(response)
  return response
}

const handler = auth(async req => {
  const response = await fetchRequestHandler({
    createContext: async () => createTRPCContext({ headers: req.headers, session: req.auth }),
    endpoint: '/api/trpc',
    onError: ({ error, path }) => console.error(`>>> tRPC Error on '${path}'`, error),
    req,
    router
  })
  setCorsHeaders(response)
  return response
})

export { handler as GET, handler as POST }
