import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { Conversation as C, InsertConversationSchema, UpdateConversationSchema } from '@a/db/schema'
import { type } from 'arktype'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  byId: publicProcedure
    .input(type('string.uuid'))
    .query(({ ctx, input }) => ctx.db.query.Conversation.findFirst({ where: eq(C.id, input) })),

  delete: p.input(type('string.uuid')).mutation(({ ctx, input }) => ctx.db.delete(C).where(eq(C.id, input))),

  insert: p.input(InsertConversationSchema).mutation(async ({ ctx: { db, user }, input }) => {
    const inserted = await db
      .insert(C)
      .values({ ...input, userId: user.id })
      .returning()
    return inserted.length === 1 ? inserted[0] : inserted
  }),

  my: p.query(({ ctx: { db, user } }) =>
    db.query.Conversation.findMany({
      columns: { messages: false },
      orderBy: desc(C.createdAt),
      where: eq(C.userId, user.id)
    })
  ),

  update: p
    .input(UpdateConversationSchema)
    .mutation(({ ctx, input }) => ctx.db.update(C).set(input).where(eq(C.id, input.id)))
} satisfies TRPCRouterRecord
