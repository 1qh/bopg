import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { idType, InsertTTSSchema, TTS, UpdateTTSSchema } from '@a/db/schema'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(async ({ ctx }) => ctx.db.query.TTS.findMany({ orderBy: desc(TTS.createdAt) })),

  delete: p.input(idType).mutation(({ ctx, input }) => ctx.db.delete(TTS).where(eq(TTS.id, input))),

  insert: p
    .input(InsertTTSSchema)
    .mutation(({ ctx: { db, user }, input }) => db.insert(TTS).values({ ...input, userId: user.id })),

  update: p.input(UpdateTTSSchema).mutation(({ ctx, input }) => ctx.db.update(TTS).set(input).where(eq(TTS.id, input.id)))
} satisfies TRPCRouterRecord
