import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { idType, InsertKESchema, KE, UpdateKESchema } from '@a/db/schema'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(async ({ ctx }) => ctx.db.query.KE.findMany({ orderBy: desc(KE.createdAt) })),

  delete: p.input(idType).mutation(({ ctx, input }) => ctx.db.delete(KE).where(eq(KE.id, input))),

  insert: p
    .input(InsertKESchema)
    .mutation(({ ctx: { db, user }, input }) => db.insert(KE).values({ ...input, userId: user.id })),

  update: p.input(UpdateKESchema).mutation(({ ctx, input }) => ctx.db.update(KE).set(input).where(eq(KE.id, input.id)))
} satisfies TRPCRouterRecord
