import type { AdapterAccountType } from 'next-auth/adapters'

import { relations } from 'drizzle-orm'
import { integer, primaryKey, pgTable as table, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod/v4'

const User = table('user', {
    email: text().notNull(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    id: uuid().defaultRandom().primaryKey(),
    image: text(),
    name: text()
  }),
  Account = table(
    'account',
    {
      access_token: text(),
      expires_at: integer(),
      id_token: text(),
      provider: text().notNull(),
      providerAccountId: text().notNull(),
      refresh_token: text(),
      scope: text(),
      session_state: text(),
      token_type: text(),
      type: text().$type<AdapterAccountType>().notNull(),
      userId: uuid()
        .notNull()
        .references(() => User.id, { onDelete: 'cascade' })
    },
    account => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
  ),
  Session = table('session', {
    expires: timestamp({ mode: 'date' }).notNull(),
    sessionToken: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' })
  }),
  Post = table('post', {
    content: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    title: varchar({ length: 256 }).notNull(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true }).$onUpdateFn(() => new Date()),
    userId: uuid()
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' })
  }),
  PostRelation = relations(Post, ({ one }) => ({
    user: one(User, { fields: [Post.userId], references: [User.id] })
  })),
  InsertPostSchema = createInsertSchema(Post, {
    content: z.string().min(1),
    title: z.string().min(1).max(256)
  }).omit({
    createdAt: true,
    updatedAt: true,
    userId: true
  }),
  UpdatePostSchema = createUpdateSchema(Post).omit({ createdAt: true, updatedAt: true }).extend({ id: z.number() })

export { Account, InsertPostSchema, Post, PostRelation, Session, UpdatePostSchema, User }
