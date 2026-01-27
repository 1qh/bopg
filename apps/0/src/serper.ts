import ky from 'ky'

import env from '~/env'

type R = Record<string, boolean | number | string>
interface Res {
  organic: SearchResult[]
}
interface SearchResult {
  link: string
  snippet: string
  title: string
}

const { post } = ky.create({ headers: { 'X-API-KEY': env.SERPER_API_KEY }, prefixUrl: 'https://google.serper.dev' }),
  singleSearch = async (q: string, params?: R) => {
    const res = await post('search', { json: { q, ...params } }).json<Res>()
    return res.organic.map(({ link, snippet, title }) => ({ link, snippet, title }))
  },
  batchWithErr = async (queries: string[], params?: R) => {
    const res = await Promise.all(
      queries.map(async q => {
        try {
          return { q, result: await singleSearch(q, params) }
        } catch (error) {
          return { err: error instanceof Error ? error : new Error(String(error)), q }
        }
      })
    )
    console.log({ params, queries, res })
    return res
  },
  search = async (queries: string[], params?: R) => {
    const res = await batchWithErr(queries, params)
    return res.filter(({ err }) => !err).flatMap(({ result }) => result)
  }

export default search
