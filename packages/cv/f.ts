/** biome-ignore-all lint/suspicious/noExplicitAny: x */
import type { paginationOptsValidator } from 'convex/server'
import type { z as _, ZodNullable, ZodNumber, ZodObject, ZodOptional, ZodRawShape } from 'zod/v4'

import { getAuthUserId } from '@convex-dev/auth/server'
import { customCtx } from 'convex-helpers/server/customFunctions'
import { zCustomMutation, zCustomQuery, zid } from 'convex-helpers/server/zod4'
import { nullable, number, object, string } from 'zod/v4'

import type { Doc, Id, TableNames } from './convex/_generated/dataModel'
import type { DatabaseReader, MutationCtx, QueryCtx } from './convex/_generated/server'

import { mutation, query } from './convex/_generated/server'

type Ctx = MutationCtx | QueryCtx
type Data<T extends TableNames> = Omit<Doc<T>, '_creationTime' | '_id' | 'updatedAt' | 'userId'>
type Own = { [K in TableNames]: Doc<K> extends { userId: Id<'users'> } ? K : never }[TableNames]
type Part<T extends TableNames> = Partial<Data<T>>
interface ReadCtx {
  db: DatabaseReader
  withAuthor: <T extends WithUser>(
    docs: T[]
  ) => Promise<(T & { author: Doc<'users'> | null | undefined; own: boolean | null })[]>
}
interface WithUser {
  userId: Id<'users'>
}

const getUser = async (c: Ctx) => {
    const userId = await getAuthUserId(c)
    if (!userId) throw new Error('Not signed in')
    const user = await c.db.get(userId)
    if (!user) throw new Error('User not found')
    return user
  },
  isOwned = (doc: null | { userId?: Id<'users'> }, userId: Id<'users'>): boolean => doc !== null && doc.userId === userId,
  ownGet =
    (c: Ctx, u: Id<'users'>) =>
    async <T extends Own>(id: Id<T>): Promise<Doc<T>> => {
      const doc = await c.db.get(id)
      if (!isOwned(doc as null | WithUser, u)) throw new Error('Not found')
      return doc as Doc<T>
    },
  withAuthor = async <T extends WithUser>(db: DatabaseReader, viewerId: Id<'users'> | null, docs: T[]) => {
    const userIds = [...new Set(docs.map(d => d.userId))],
      users = await Promise.all(userIds.map(async id => db.get(id))),
      userMap = new Map(users.map(u => [u?._id, u]))
    return docs.map(d => ({
      ...d,
      author: userMap.get(d.userId),
      own: viewerId === null ? null : viewerId === d.userId
    }))
  },
  readHandler = async <T extends Own>(c: ReadCtx, { id }: { id: Id<T> }) => {
    const doc = await c.db.get(id)
    if (!doc) return null
    const [result] = await c.withAuthor([doc as Doc<T> & WithUser])
    return result
  },
  pq = zCustomQuery(
    query,
    customCtx(async c => {
      const viewerId = await getAuthUserId(c)
      return {
        db: c.db,
        viewerId,
        withAuthor: async <T extends WithUser>(docs: T[]) => withAuthor(c.db, viewerId, docs)
      }
    })
  ),
  q = zCustomQuery(
    query,
    customCtx(async c => {
      const user = await getUser(c)
      return {
        db: c.db,
        get: ownGet(c, user._id),
        my: <T extends Own>(t: T) => c.db.query(t).withIndex('by_user', o => o.eq('userId', user._id as never)),
        user,
        withAuthor: async <T extends WithUser>(docs: T[]) => withAuthor(c.db, user._id, docs)
      }
    })
  ),
  m = zCustomMutation(
    mutation,
    customCtx(async c => {
      const time = { updatedAt: Date.now() },
        user = await getUser(c),
        { db } = c,
        get = ownGet(c, user._id)
      return {
        create: async <T extends Own>(t: T, d: Data<T>) => db.insert(t, { ...d, ...time, userId: user._id } as never),
        db,
        delete: async <T extends Own>(id: Id<T>) => {
          const doc = await get(id)
          await db.delete(id)
          return doc
        },
        get,
        patch: async <T extends Own>(id: Id<T>, data: ((doc: Doc<T>) => Part<T> | Promise<Part<T>>) | Part<T>) => {
          const doc = await get(id),
            updates = typeof data === 'function' ? await data(doc) : data
          await db.patch(id, { ...updates, ...time } as unknown as Partial<Doc<T>>)
          return { ...doc, ...updates, ...time } as Doc<T>
        },
        user
      }
    })
  ),
  crud = <T extends Own, S extends ZodRawShape>(table: T, schema: ZodObject<S>) => {
    type OwnedDoc = Doc<T> & WithUser
    const idArgs = { id: zid(table) },
      listArgs = {
        paginationOpts: object({
          cursor: nullable(string()),
          endCursor: nullable(string()).optional(),
          id: number().optional(),
          maximumBytesRead: number().optional(),
          maximumRowsRead: number().optional(),
          numItems: number()
        } satisfies Record<keyof typeof paginationOptsValidator.fields, ZodNullable | ZodNumber | ZodOptional>)
      },
      allHandler = async (c: ReadCtx) => c.withAuthor((await c.db.query(table).order('desc').collect()) as OwnedDoc[]),
      listHandler = async (
        c: ReadCtx,
        { paginationOpts: opt }: { paginationOpts: _.infer<typeof listArgs.paginationOpts> }
      ) => {
        const { page, ...rest } = await c.db.query(table).order('desc').paginate(opt)
        return { ...rest, page: await c.withAuthor(page as OwnedDoc[]) }
      }
    return {
      auth: {
        all: q({ handler: allHandler }),
        list: q({ args: listArgs, handler: listHandler }),
        read: q({ args: idArgs, handler: readHandler<T> })
      },
      create: m({ args: schema.shape, handler: async (c, a) => c.create(table, a as Data<T>) }),
      my: q({ handler: async c => c.my(table).order('desc').collect() }),
      pub: {
        all: pq({ handler: allHandler }),
        list: pq({ args: listArgs, handler: listHandler }),
        read: pq({ args: idArgs, handler: readHandler<T> })
      },
      rm: m({ args: idArgs, handler: async (c, { id }) => c.delete(id as Id<T>) }),
      update: m({
        args: { ...idArgs, ...schema.partial().shape },
        handler: async (c, a) => {
          const { id, ...d } = a as Record<string, unknown> & { id: Id<T> },
            ret = await c.patch(id, d as Part<T>)
          return ret
        }
      })
    }
  }

export { crud, m, pq, q }
