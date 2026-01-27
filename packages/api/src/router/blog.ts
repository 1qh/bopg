import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { InsertBlogSchema as Insert, Blog as T, UpdateBlogSchema as Update } from '@a/db/schema'
import { number, object } from 'zod/v4'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(async ({ ctx: { db, session } }) => {
    const blogs = await db.query.Blog.findMany({ orderBy: desc(T.createdAt), with: { user: true } })
    return blogs.map(b => ({ ...b, own: session?.user.id === b.userId }))
  }),

  byId: publicProcedure.input(number()).query(async ({ ctx: { db, session }, input }) => {
    const blog = await db.query.Blog.findFirst({ where: eq(T.id, input), with: { user: true } })
    return blog ? { ...blog, own: session?.user.id === blog.userId } : null
  }),

  delete: p.input(number()).mutation(({ ctx, input }) => ctx.db.delete(T).where(eq(T.id, input))),

  infinite: publicProcedure
    .input(object({ cursor: number().nullish(), limit: number().min(1) }))
    .query(async ({ ctx: { db, session }, input: { cursor, limit } }) => {
      const offset = cursor ?? 0,
        items = await db.query.Blog.findMany({ limit, offset, orderBy: desc(T.createdAt), with: { user: true } })
      return {
        items: items.map(b => ({ ...b, own: session?.user.id === b.userId })),
        next: items.length === limit ? offset + limit : null
      }
    }),

  insert: p.input(Insert).mutation(({ ctx, input }) => ctx.db.insert(T).values({ ...input, userId: ctx.user.id })),

  update: p.input(Update).mutation(({ ctx, input }) => ctx.db.update(T).set(input).where(eq(T.id, input.id)))
} satisfies TRPCRouterRecord
