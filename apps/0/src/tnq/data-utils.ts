import type { Options } from 'ky'

import { env } from 'bun'
import ky from 'ky'
import { log } from 'node:console'

import type { Metadata } from './constant'

const groupKey = env.GROUP_KEY,
  endpoint = env.API_URL,
  apiKey = env.API_KEY

if (!(groupKey && endpoint && apiKey)) throw new Error('missing env')

const { post } = ky,
  queryOptions = { endTime: 0, startTime: 0, table: 'dummy' },
  headers = { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
  kyOptions: Options = { headers, timeout: false },
  q = async <T>(eql: string) => post(endpoint, { json: { ...queryOptions, query: eql }, ...kyOptions }).json<T>(),
  getEvents = async (eql: string) => {
    const res = await q<{ events: { data: { _ts: unknown } }[] }>(eql)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return res.events.map(({ data: { _ts, ...rest } }) => rest)
  },
  getGroups = async (eql: string) => {
    const res = await q<{ data: string[][] }>(eql)
    return res.data.flat()
  },
  getCount = async (eql: string) => {
    log(eql)
    const res = await q<{ data: [number, number][] }>(eql)
    return res.data[1]?.[0]
  },
  getGroupedEvents = async (metadata: Metadata) => {
    const { appVersion, db, time } = metadata,
      t = `time from '${time.start} 00:00:00' to '${time.end} 00:00:00'`,
      groups = await getGroups(`select ${groupKey} from ${db} ${t}`)
    log(groups.length, groups)
    const out = await Promise.all(
      groups.map(async e => {
        const a = await getEvents(
          `select * from ${db} where ${groupKey} in ('${e}') and app_version in ('${appVersion}') ${t}`
        )
        log(e, a.length)
        return a
      })
    )
    return { data: out.flat(), metadata }
  },
  getPlainCount = async (metadata: Metadata) => {
    const { appVersion, db, time } = metadata,
      eql = `select count() from ${db} where app_version in ('${appVersion}') time from '${time.start} 00:00:00' to '${time.end} 00:00:00'`,
      res = await getCount(eql)
    return res
  },
  getPropCounts = async ({ eventName, metadata, prop }: { eventName?: string; metadata: Metadata; prop: string }) => {
    const { appVersion, db, time } = metadata,
      eql = `select count() from ${db} where app_version in ('${appVersion}') and ${prop}$WHERE$ ${eventName ? `and event_name='^${eventName}$'` : ''} time from '${time.start} 00:00:00' to '${time.end} 00:00:00'`,
      res = {
        none: await getCount(eql.replace('$WHERE$', '="^.*$"')),
        num: await getCount(eql.replace('$WHERE$', ' between (-99999999999999999999, 99999999999999999999)')),
        str: await getCount(eql.replace('$WHERE$', ' is none'))
      }
    return res
  }

export { getGroupedEvents, getPlainCount, getPropCounts }
