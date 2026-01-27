import type { TRPCRouterRecord } from '@trpc/server'

import { and, desc, eq } from '@a/db'
import { Flow, idType, InsertFlowSchema, UpdateFlowSchema } from '@a/db/schema'
import { TRPCError } from '@trpc/server'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(({ ctx }) => ctx.db.query.Flow.findMany({ orderBy: desc(Flow.createdAt) })),

  byId: publicProcedure
    .input(idType)
    .query(({ ctx, input }) => ctx.db.query.Flow.findFirst({ where: eq(Flow.id, input) })),

  delete: p.input(idType).mutation(({ ctx, input }) => ctx.db.delete(Flow).where(eq(Flow.id, input))),

  insert: p.input(InsertFlowSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.query.Flow.findFirst({
      where: and(eq(Flow.userId, ctx.user.id), eq(Flow.title, input.title))
    })
    if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Name already exists' })
    const inserted = await ctx.db
      .insert(Flow)
      .values({ ...input, userId: ctx.user.id })
      .returning()
    return inserted.length === 1 ? inserted[0] : inserted
  }),

  update: p.input(UpdateFlowSchema).mutation(async ({ ctx, input }) => {
    if (input.title) {
      const existing = await ctx.db.query.Flow.findFirst({
        where: and(eq(Flow.userId, ctx.user.id), eq(Flow.title, input.title))
      })
      if (existing && existing.id !== input.id) throw new TRPCError({ code: 'CONFLICT', message: 'Name already exists' })
    }
    return ctx.db.update(Flow).set(input).where(eq(Flow.id, input.id))
  })
} satisfies TRPCRouterRecord
