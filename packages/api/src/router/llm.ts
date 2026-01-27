import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { idType, InsertLLMSchema, LLM, UpdateLLMSchema } from '@a/db/schema'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(async ({ ctx }) => ctx.db.query.LLM.findMany({ orderBy: desc(LLM.createdAt) })),

  delete: p.input(idType).mutation(({ ctx, input }) => ctx.db.delete(LLM).where(eq(LLM.id, input))),

  insert: p
    .input(InsertLLMSchema)
    .mutation(({ ctx: { db, user }, input }) => db.insert(LLM).values({ ...input, userId: user.id })),

  update: p.input(UpdateLLMSchema).mutation(({ ctx, input }) => ctx.db.update(LLM).set(input).where(eq(LLM.id, input.id)))
} satisfies TRPCRouterRecord
