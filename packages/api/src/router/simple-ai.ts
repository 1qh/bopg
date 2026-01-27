import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { InsertSimpleAiSchema, SimpleAi, UpdateSimpleAiSchema } from '@a/db/schema'
import { type } from 'arktype'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.query.SimpleAi.findMany({ orderBy: desc(SimpleAi.createdAt), with: { user: true } })
  ),

  byId: publicProcedure
    .input(type('number'))
    .query(({ ctx, input }) => ctx.db.query.SimpleAi.findFirst({ where: eq(SimpleAi.id, input), with: { user: true } })),

  delete: p.input(type('number')).mutation(({ ctx, input }) => ctx.db.delete(SimpleAi).where(eq(SimpleAi.id, input))),

  insert: p.input(InsertSimpleAiSchema).mutation(async ({ ctx, input }) => {
    const inserted = await ctx.db
      .insert(SimpleAi)
      .values({ ...input, userId: ctx.user.id })
      .returning()
    return inserted.length === 1 ? inserted[0] : inserted
  }),

  update: p
    .input(UpdateSimpleAiSchema)
    .mutation(({ ctx, input }) => ctx.db.update(SimpleAi).set(input).where(eq(SimpleAi.id, input.id)))
} satisfies TRPCRouterRecord
