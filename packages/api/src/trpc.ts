import type { Session } from '@a/auth'

import { auth, validateToken } from '@a/auth'
import { db } from '@a/db/client'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { z, ZodError } from 'zod/v4'

const isomorphicGetSession = async (headers: Headers) => {
  const authToken = headers.get('Authorization') ?? null
  if (authToken) return validateToken(authToken)
  return auth()
}

export const createTRPCContext = async (opts: { headers: Headers; session: null | Session }) => {
  const authToken = opts.headers.get('Authorization') ?? null,
    session = await isomorphicGetSession(opts.headers),
    source = opts.headers.get('x-trpc-source') ?? 'unknown'
  console.log('>>> tRPC Request from', source, 'by', session?.user)

  return {
    db,
    session,
    token: authToken
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter: ({ error, shape }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? z.treeifyError(error.cause) : null
    }
  }),
  transformer: superjson
})

export const { createCallerFactory } = t

export const createTRPCRouter = t.router

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise(resolve => setTimeout(resolve, waitMs))
  }

  const result = await next(),
    end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const protectedProcedure = t.procedure.use(timingMiddleware).use(async ({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: ctx.session
  })
})
