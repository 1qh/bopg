import type { Auth, Session } from '@a/auth'

import db from '@a/db/client'
import { initTRPC, TRPCError } from '@trpc/server'
import transformer from 'superjson'
import { flattenError, ZodError } from 'zod/v4'

const trpcContext = async (opts: {
    auth: Auth
    headers: Headers
  }): Promise<{
    authApi: Auth['api']
    db: typeof db
    session: null | Session
  }> => {
    const authApi = opts.auth.api,
      { response: session } = await authApi.getSession({ headers: opts.headers, returnHeaders: true })
    return { authApi, db, session }
  },
  {
    middleware,
    procedure,
    router: createRouter
  } = initTRPC.context<typeof trpcContext>().create({
    errorFormatter: ({ error, shape }) => ({
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? flattenError(error.cause as ZodError<Record<string, unknown>>) : null
      }
    }),
    transformer
  }),
  timing = middleware(async ({ next, path }) => {
    const start = Date.now(),
      result = await next()
    console.log(`${path} | ${Date.now() - start}ms`)
    return result
  }),
  publicProcedure = procedure.use(timing),
  // biome-ignore lint/suspicious/useAwait: x
  authProcedure = procedure.use(timing).use(async ({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
    return next({ ctx: ctx.session })
  })

export { authProcedure, createRouter, publicProcedure, trpcContext }
