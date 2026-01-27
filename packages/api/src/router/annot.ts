import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { InsertAnnotSchema, UpdateAnnotSchema, Annot as W } from '@a/db/schema'
import { type } from 'arktype'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.query.Annot.findMany({
      columns: {
        ava: true,
        createdAt: true,
        description: true,
        id: true,
        tags: true,
        title: true,
        updatedAt: true,
        userId: true
      },
      orderBy: desc(W.createdAt),
      with: { user: true }
    })
  ),

  delete: p.input(type('number')).mutation(({ ctx, input }) => ctx.db.delete(W).where(eq(W.id, input))),

  insert: p.input(InsertAnnotSchema).mutation(async ({ ctx, input }) => {
    const inserted = await ctx.db
      .insert(W)
      .values({ ...input, userId: ctx.user.id })
      .returning()
    return inserted.length === 1 ? inserted[0] : inserted
  }),

  tagsById: publicProcedure.input(type('number')).query(async ({ ctx, input }) => {
    const res = await ctx.db.query.Annot.findFirst({ columns: { tags: true }, where: eq(W.id, input) })
    return res?.tags ?? []
  }),

  update: p.input(UpdateAnnotSchema).mutation(({ ctx, input }) => ctx.db.update(W).set(input).where(eq(W.id, input.id)))
} satisfies TRPCRouterRecord
