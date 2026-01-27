import type { ZodObject, ZodRawShape } from 'zod/v4'

import { authTables } from '@convex-dev/auth/server'
import { zodOutputToConvexFields } from 'convex-helpers/server/zod4'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

import t from '../t'

const { id, number } = v,
  n = <T extends ZodRawShape>(schema: ZodObject<T>) =>
    defineTable({
      ...zodOutputToConvexFields(schema.shape),
      updatedAt: number(),
      userId: id('users')
    })

export default defineSchema({
  ...authTables,
  ...({
    blog: n(t.blog).index('by_user', ['userId']).index('by_slug', ['slug']).index('by_published', ['published']),
    message: n(t.message).index('by_user', ['userId'])
  } satisfies Record<keyof typeof t, ReturnType<typeof n>>)
})
