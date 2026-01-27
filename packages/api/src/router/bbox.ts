import type { TRPCRouterRecord } from '@trpc/server'

import { asc, eq } from '@a/db'
import { Bbox as B, InsertBboxSchema, UpdateBboxSchema } from '@a/db/schema'
import { type } from 'arktype'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  byAnnot: publicProcedure
    .input(type('number'))
    .query(({ ctx, input }) => ctx.db.query.Bbox.findMany({ orderBy: asc(B.id), where: eq(B.annot, input) })),

  byId: publicProcedure
    .input(type('string'))
    .query(({ ctx, input }) => ctx.db.query.Bbox.findFirst({ where: eq(B.id, input) })),

  delete: p.input(type('string')).mutation(({ ctx, input }) => ctx.db.delete(B).where(eq(B.id, input))),

  insert: p.input(InsertBboxSchema).mutation(async ({ ctx, input }) => {
    const inserted = await ctx.db.insert(B).values(input).returning()
    return inserted.length === 1 ? inserted[0] : inserted
  }),

  update: p.input(UpdateBboxSchema).mutation(({ ctx, input }) => ctx.db.update(B).set(input).where(eq(B.id, input.id)))
} satisfies TRPCRouterRecord
