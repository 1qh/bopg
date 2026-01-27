import type { Edge, Node } from '@xyflow/react'
import type { UIMessage } from 'ai'
import type {
  flowVariableSchema,
  interruptionSchema,
  knowledgeRetrievalSettingSchema,
  transferSettingSchema
} from 'constant'
import type { AppUsage, HWXY } from 'types'

import { type } from 'arktype'
import {
  conversationSummarySchema,
  customToolSchema,
  dataCollectionLlmItemSchema,
  dataCollectionVariableItemSchema,
  defaultNodes,
  dynamicVariableSchema,
  endCallInstruction,
  kvSchema,
  langs,
  langSchema,
  llmSettingsSchema,
  phoneSchema,
  transferToOperatorInstruction,
  vietnameseDictionarySchema,
  VISIBILITIES
} from 'constant'
import { createInsertSchema, createUpdateSchema } from 'drizzle-arktype'
import { relations } from 'drizzle-orm'
import {
  boolean,
  char,
  foreignKey,
  integer,
  jsonb,
  numeric,
  // biome-ignore lint/nursery/noDeprecatedImports: x
  primaryKey,
  smallint,
  pgTable as t,
  text,
  timestamp,
  uuid,
  varchar as vc
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { s } from 'utils'

const times = {
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  user = t('user', {
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    id: text().primaryKey(),
    image: text(),
    isAnonymous: boolean(),
    name: text().notNull(),
    ...times
  }),
  ownership = {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  session = t('session', {
    expiresAt: timestamp().notNull(),
    id: text().primaryKey(),
    ipAddress: text(),
    token: text().notNull().unique(),
    userAgent: text(),
    ...ownership,
    ...times
  }),
  account = t('account', {
    accessToken: text(),
    accessTokenExpiresAt: timestamp(),
    accountId: text().notNull(),
    id: text().primaryKey(),
    idToken: text(),
    password: text(),
    providerId: text().notNull(),
    refreshToken: text(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    ...ownership,
    ...times
  }),
  verification = t('verification', {
    expiresAt: timestamp().notNull(),
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    ...times
  }),
  ssoProvider = t('sso_provider', {
    domain: text().notNull(),
    id: text().primaryKey(),
    issuer: text().notNull(),
    oidcConfig: text(),
    organizationId: text(),
    providerId: text().notNull().unique(),
    samlConfig: text(),
    ...ownership
  }),
  Blog = t('blog', {
    content: text().notNull().default(''),
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    title: vc({ length: 64 }).notNull(),
    ...ownership,
    ...times
  }),
  BlogRelation = relations(Blog, ({ one }) => ({
    user: one(user, { fields: [Blog.userId], references: [user.id] })
  })),
  InsertBlogSchema = createInsertSchema(Blog, {
    content: s(),
    title: s(64)
  }).omit('createdAt', 'updatedAt', 'userId'),
  UpdateBlogSchema = createUpdateSchema(Blog, { id: type('number') }).omit('createdAt', 'updatedAt'),
  Conversation = t('conversation', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    messages: jsonb().array().$type<UIMessage[]>().notNull().default([]),
    title: vc({ length: 128 }).notNull(),
    ...ownership,
    ...times
  }),
  InsertConversationSchema = createInsertSchema(Conversation).omit('createdAt', 'updatedAt', 'userId'),
  UpdateConversationSchema = createUpdateSchema(Conversation, { id: type('string') }).omit('createdAt', 'updatedAt'),
  SimpleAi = t('simple-ai', {
    ava: text().notNull().default(''),
    content: jsonb()
      .$type<{ edges: object[]; nodes: object[]; template?: string }>()
      .notNull()
      .default({ edges: [], nodes: [] }),
    description: vc({ length: 2048 }).notNull().default(''),
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    title: vc({ length: 64 }).notNull(),
    ...ownership,
    ...times
  }),
  SimpleAiRelation = relations(SimpleAi, ({ one }) => ({
    user: one(user, { fields: [SimpleAi.userId], references: [user.id] })
  })),
  InsertSimpleAiSchema = createInsertSchema(SimpleAi).omit('createdAt', 'updatedAt', 'userId'),
  UpdateSimpleAiSchema = createUpdateSchema(SimpleAi, { id: type('number') }).omit('createdAt', 'updatedAt'),
  Annot = t('annot', {
    ava: text().notNull().default(''),
    description: vc({ length: 2048 }).notNull().default(''),
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    tags: jsonb().$type<string[]>().notNull().default([]),
    title: vc({ length: 64 }).notNull(),
    ...ownership,
    ...times
  }),
  AnnotRelation = relations(Annot, ({ one }) => ({
    user: one(user, { fields: [Annot.userId], references: [user.id] })
  })),
  InsertAnnotSchema = createInsertSchema(Annot).omit('createdAt', 'updatedAt', 'userId'),
  UpdateAnnotSchema = createUpdateSchema(Annot, { id: type('number') }).omit('createdAt', 'updatedAt'),
  Bbox = t('box', {
    annot: integer()
      .notNull()
      .references(() => Annot.id, { onDelete: 'cascade' }),
    hwxy: jsonb().$type<HWXY>().notNull(),
    id: text().primaryKey(),
    path: text().notNull(),
    predict: text(),
    src: text().notNull(),
    tag: text(),
    ...times
  }),
  InsertBboxSchema = createInsertSchema(Bbox).omit('createdAt', 'updatedAt'),
  UpdateBboxSchema = createUpdateSchema(Bbox, { id: s() }).omit('createdAt', 'updatedAt'),
  chat = t('Chat', {
    createdAt: timestamp().defaultNow().notNull(),
    id: uuid().primaryKey().notNull().defaultRandom(),
    lastContext: jsonb().$type<AppUsage | null>(),
    title: text().notNull(),
    visibility: vc({ enum: VISIBILITIES }).notNull().default('private'),
    ...ownership
  }),
  message = t('Message', {
    chatId: uuid()
      .notNull()
      .references(() => chat.id),
    createdAt: timestamp().defaultNow().notNull(),
    id: uuid().primaryKey().notNull().defaultRandom(),
    parts: jsonb().notNull(),
    role: vc().notNull()
  }),
  vote = t(
    'Vote',
    {
      chatId: uuid()
        .notNull()
        .references(() => chat.id),
      isUpvoted: boolean().notNull(),
      messageId: uuid()
        .notNull()
        .references(() => message.id)
    },
    tb => [primaryKey({ columns: [tb.chatId, tb.messageId] })]
  ),
  document = t(
    'Document',
    {
      content: text(),
      createdAt: timestamp().defaultNow().notNull(),
      id: uuid().notNull().defaultRandom(),
      kind: vc({ enum: ['text', 'code', 'image', 'sheet'] })
        .notNull()
        .default('text'),
      title: text().notNull(),
      ...ownership
    },
    tb => [primaryKey({ columns: [tb.id, tb.createdAt] })]
  ),
  suggestion = t(
    'Suggestion',
    {
      createdAt: timestamp().defaultNow().notNull(),
      description: text(),
      documentCreatedAt: timestamp().defaultNow().notNull(),
      documentId: uuid().notNull(),
      id: uuid().notNull().defaultRandom(),
      isResolved: boolean().notNull().default(false),
      originalText: text().notNull(),
      suggestedText: text().notNull(),
      ...ownership
    },
    tb => [
      foreignKey({
        columns: [tb.documentId, tb.documentCreatedAt],
        foreignColumns: [document.id, document.createdAt]
      }),
      primaryKey({ columns: [tb.id] })
    ]
  ),
  stream = t(
    'Stream',
    {
      chatId: uuid().notNull(),
      createdAt: timestamp().defaultNow().notNull(),
      id: uuid().notNull().defaultRandom()
    },
    tb => [
      foreignKey({
        columns: [tb.chatId],
        foreignColumns: [chat.id]
      }),
      primaryKey({ columns: [tb.id] })
    ]
  ),
  idType = type('string == 26'),
  LLM = t('llm', {
    id: char({ length: 26 })
      .primaryKey()
      .$default(() => ulid()),
    languages: vc({ enum: langs }).array().notNull().default([]),
    model: vc({ length: 64 }).notNull().default(''),
    name: vc({ length: 64 }).notNull().default(''),
    provider: vc({ length: 16 }).notNull().default(''),
    secret: vc({ length: 2048 }).notNull().default(''),
    url: vc({ length: 2048 }).notNull().default(''),
    ...ownership,
    ...times
  }),
  LLMValid = {
    languages: langSchema.array(),
    model: s(),
    name: s(),
    provider: s(),
    url: type('string.url > 0')
  },
  InsertLLMSchema = createInsertSchema(LLM, LLMValid).omit('createdAt', 'updatedAt', 'userId'),
  UpdateLLMSchema = createUpdateSchema(LLM, { id: idType, ...LLMValid }).omit('createdAt', 'updatedAt', 'userId'),
  TTS = t('tts', {
    description: vc({ length: 2048 }).notNull().default(''),
    id: char({ length: 26 })
      .primaryKey()
      .$default(() => ulid()),
    labels: vc({ length: 64 }).array().notNull().default([]),
    language: vc({ enum: langs }).notNull().default('english'),
    name: vc({ length: 64 }).notNull().default(''),
    primaryURL: vc({ length: 2048 }).notNull().default(''),
    provider: vc({ length: 16 }).notNull().default(''),
    secondaryURL: vc({ length: 2048 }).notNull().default(''),
    secret: vc({ length: 2048 }).notNull().default(''),
    voice: vc({ length: 64 }).notNull().default(''),
    ...ownership,
    ...times
  }),
  TTSValid = {
    language: langSchema,
    name: s(),
    primaryURL: type('string.url > 0'),
    provider: s(),
    voice: s()
  },
  InsertTTSSchema = createInsertSchema(TTS, TTSValid).omit('createdAt', 'updatedAt', 'userId'),
  UpdateTTSSchema = createUpdateSchema(TTS, { id: idType, ...TTSValid }).omit('createdAt', 'updatedAt', 'userId'),
  KE = t('ke', {
    description: vc({ length: 2048 }).notNull().default(''),
    id: char({ length: 26 })
      .primaryKey()
      .$default(() => ulid()),
    model: vc({ length: 64 }).notNull().default(''),
    secret: vc({ length: 2048 }).notNull().default(''),
    url: vc({ length: 2048 }).notNull().default(''),
    ...ownership,
    ...times
  }),
  KEValid = {
    model: s(),
    url: type('string.url > 0')
  },
  InsertKESchema = createInsertSchema(KE, KEValid).omit('createdAt', 'updatedAt', 'userId'),
  UpdateKESchema = createUpdateSchema(KE, { id: idType, ...KEValid }).omit('createdAt', 'updatedAt', 'userId'),
  agentMutual = {
    fallbackEndCallMessage: text().notNull().default(''),
    language: vc({ enum: langs }).notNull().default('english'),
    maxConversationDuration: smallint().notNull().default(600),
    silenceEndCallTimeout: smallint().notNull().default(3),
    title: vc({ length: 64 }).notNull().default(''),
    turnListeningTimeout: smallint().notNull().default(10)
  },
  Flow = t('flow', {
    ava: text().notNull().default(''),
    description: vc({ length: 2048 }).notNull().default(''),
    edges: jsonb().array().$type<Edge[]>().notNull().default([]),
    id: char({ length: 26 })
      .primaryKey()
      .$default(() => ulid()),
    nodes: jsonb().array().$type<Node[]>().notNull().default(defaultNodes),
    variables: jsonb().array().$type<(typeof flowVariableSchema.infer)[]>().notNull().default([]),
    ...agentMutual,
    ...ownership,
    ...times
  }),
  InsertFlowSchema = createInsertSchema(Flow, {
    title: s(64)
  }).omit('createdAt', 'updatedAt', 'userId', 'edges', 'nodes'),
  UpdateFlowSchema = createUpdateSchema(Flow, {
    id: idType,
    title: s(64).optional()
  }).omit('createdAt', 'updatedAt'),
  Solo = t('solo', {
    callCenterSettings: jsonb().$type<(typeof kvSchema.infer)[]>().notNull().default([]),
    conversationFlow: text().notNull().default(''),
    conversationSummary: jsonb().$type<typeof conversationSummarySchema.infer>().notNull().default({
      enable: false,
      maxTokens: 500,
      systemPrompt: '',
      temperature: 0
    }),
    customClientSettings: jsonb().$type<(typeof kvSchema.infer)[]>().notNull().default([]),
    customTools: jsonb().$type<(typeof customToolSchema.infer)[]>().notNull().default([]),
    dataCollection: jsonb().$type<typeof llmSettingsSchema.infer>().notNull().default({
      systemPrompt: '',
      temperature: 0
    }),
    dataCollectionLlmItems: jsonb().$type<(typeof dataCollectionLlmItemSchema.infer)[]>().notNull().default([]),
    dataCollectionVariableItems: jsonb().$type<(typeof dataCollectionVariableItemSchema.infer)[]>().notNull().default([]),
    dynamicVariables: jsonb().$type<(typeof dynamicVariableSchema.infer)[]>().notNull().default([]),
    endCallInstruction: text().notNull().default(endCallInstruction.english),
    guideline: text().notNull().default(''),
    id: char({ length: 26 })
      .primaryKey()
      .$default(() => ulid()),
    initVariablesLuaScript: text().notNull().default(''),
    interruption: jsonb().$type<typeof interruptionSchema.infer>().notNull().default({
      enable: false,
      method: 'immediate',
      phrases: [],
      silence: 0.5,
      systemPrompt: ''
    }),
    knowledgeRetrievalSetting: jsonb().$type<typeof knowledgeRetrievalSettingSchema.infer>().notNull().default({
      description: '',
      enable: false,
      ke: ''
    }),
    llm: vc({ length: 64 }),
    maxTokens: integer().notNull().default(-1),
    persona: text().notNull().default(''),
    postprocessLuaScript: text().notNull().default(''),
    scenario: text().notNull().default(''),
    temperature: numeric({ mode: 'number', precision: 3, scale: 2 }).notNull().default(0),
    transferPhones: jsonb().$type<(typeof phoneSchema.infer)[]>().notNull().default([]),
    transferSetting: jsonb().$type<typeof transferSettingSchema.infer>().notNull().default({
      enable: false,
      instruction: transferToOperatorInstruction.english
    }),
    vietnameseDictionary: jsonb().$type<(typeof vietnameseDictionarySchema.infer)[]>().notNull().default([]),
    voice: vc({ length: 64 }),
    welcomeMessage: text().notNull().default(''),
    ...agentMutual,
    ...ownership,
    ...times
  }),
  SoloRelation = relations(Solo, ({ one }) => ({
    user: one(user, { fields: [Solo.userId], references: [user.id] })
  })),
  InsertSoloSchema = createInsertSchema(Solo, {
    title: s(64)
  }).omit('createdAt', 'updatedAt', 'userId'),
  UpdateSoloSchema = createUpdateSchema(Solo, {
    callCenterSettings: kvSchema.array().optional(),
    conversationSummary: conversationSummarySchema.optional(),
    customClientSettings: kvSchema.array().optional(),
    customTools: customToolSchema.array().optional(),
    dataCollection: llmSettingsSchema.optional(),
    dataCollectionLlmItems: dataCollectionLlmItemSchema.array().optional(),
    dataCollectionVariableItems: dataCollectionVariableItemSchema.array().optional(),
    dynamicVariables: dynamicVariableSchema.array().optional(),
    id: idType,
    initVariablesLuaScript: type('string < 20000').optional(),
    maxConversationDuration: type('10 <= number <= 3600'),
    postprocessLuaScript: type('string < 20000').optional(),
    silenceEndCallTimeout: type('0 < number <= 10'),
    temperature: type('0 <= number <= 1').optional(),
    title: s(64).optional(),
    transferPhones: phoneSchema.array().optional(),
    turnListeningTimeout: type('0 < number <= 100'),
    vietnameseDictionary: vietnameseDictionarySchema.array().optional()
  }).omit('createdAt', 'updatedAt')

type Account = typeof account.$inferSelect
type Box = Omit<typeof Bbox.$inferInsert, 'annot' | 'path'>
type Chat = typeof chat.$inferSelect
type Convo = typeof Conversation.$inferSelect
type DBMessage = typeof message.$inferSelect
type Document = typeof document.$inferSelect
type Session = Omit<typeof session.$inferSelect, 'ipAddress' | 'userAgent'>
type Stream = typeof stream.$inferSelect
type Suggestion = typeof suggestion.$inferSelect
type User = typeof user.$inferSelect
type Verification = typeof verification.$inferSelect
type Vote = typeof vote.$inferSelect

export {
  account,
  Annot,
  AnnotRelation,
  Bbox,
  Blog,
  BlogRelation,
  chat,
  Conversation,
  document,
  Flow,
  idType,
  InsertAnnotSchema,
  InsertBboxSchema,
  InsertBlogSchema,
  InsertConversationSchema,
  InsertFlowSchema,
  InsertKESchema,
  InsertLLMSchema,
  InsertSimpleAiSchema,
  InsertSoloSchema,
  InsertTTSSchema,
  KE,
  LLM,
  message,
  session,
  SimpleAi,
  SimpleAiRelation,
  Solo,
  SoloRelation,
  ssoProvider,
  stream,
  suggestion,
  TTS,
  UpdateAnnotSchema,
  UpdateBboxSchema,
  UpdateBlogSchema,
  UpdateConversationSchema,
  UpdateFlowSchema,
  UpdateKESchema,
  UpdateLLMSchema,
  UpdateSimpleAiSchema,
  UpdateSoloSchema,
  UpdateTTSSchema,
  user,
  verification,
  vote
}
export type { Account, Box, Chat, Convo, DBMessage, Document, Session, Stream, Suggestion, User, Verification, Vote }
