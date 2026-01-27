import type { TRPCRouterRecord } from '@trpc/server'

import { and, desc, eq } from '@a/db'
import { idType, InsertSoloSchema, Solo, UpdateSoloSchema } from '@a/db/schema'
import { TRPCError } from '@trpc/server'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.query.Solo.findMany({ orderBy: desc(Solo.createdAt), with: { user: true } })
  ),

  byId: publicProcedure
    .input(idType)
    .query(({ ctx, input }) => ctx.db.query.Solo.findFirst({ where: eq(Solo.id, input) })),

  delete: p.input(idType).mutation(({ ctx, input }) => ctx.db.delete(Solo).where(eq(Solo.id, input))),

  insert: p.input(InsertSoloSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.query.Solo.findFirst({
      where: and(eq(Solo.userId, ctx.user.id), eq(Solo.title, input.title))
    })
    if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Name already exists' })
    const inserted = await ctx.db
      .insert(Solo)
      .values({ ...input, userId: ctx.user.id })
      .returning()
    return inserted.length === 1 ? inserted[0] : inserted
  }),

  update: p.input(UpdateSoloSchema).mutation(async ({ ctx, input }) => {
    if (input.title) {
      const existing = await ctx.db.query.Solo.findFirst({
        where: and(eq(Solo.userId, ctx.user.id), eq(Solo.title, input.title))
      })
      if (existing && existing.id !== input.id) throw new TRPCError({ code: 'CONFLICT', message: 'Name already exists' })
    }
    return ctx.db.update(Solo).set(input).where(eq(Solo.id, input.id))
  })
} satisfies TRPCRouterRecord
