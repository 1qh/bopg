import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@a/db'
import { InsertPostSchema, Post, UpdatePostSchema } from '@a/db/schema'
import { z } from 'zod/v4'

import { protectedProcedure, publicProcedure } from '../trpc'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.query.Post.findMany({ orderBy: desc(Post.createdAt), with: { user: true } })
  ),

  delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => ctx.db.delete(Post).where(eq(Post.id, input))),

  infinite: publicProcedure
    .input(z.object({ cursor: z.number().nullish(), limit: z.number().min(1) }))
    .query(async ({ ctx, input: { cursor, limit } }) => {
      const offset = cursor ?? 0,
        items = await ctx.db.query.Post.findMany({
          limit,
          offset,
          orderBy: desc(Post.createdAt),
          with: { user: true }
        })
      return {
        items,
        next: items.length === limit ? offset + limit : null
      }
    }),

  insert: protectedProcedure
    .input(InsertPostSchema)
    .mutation(({ ctx, input }) => ctx.db.insert(Post).values({ ...input, userId: ctx.user.id })),

  update: protectedProcedure
    .input(UpdatePostSchema)
    .mutation(({ ctx, input }) => ctx.db.update(Post).set(input).where(eq(Post.id, input.id)))
} satisfies TRPCRouterRecord
