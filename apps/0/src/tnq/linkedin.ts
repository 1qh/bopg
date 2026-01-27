/* eslint-disable no-await-in-loop */
/** biome-ignore-all lint/performance/noAwaitInLoops: x */
import { load } from 'cheerio'
import ky from 'ky'
import pMap from 'p-map'
import UserAgent from 'user-agents'
import { sleep } from 'utils'

const referers = ['https://www.google.com/', 'https://www.bing.com/', 'https://www.yahoo.com/'],
  linkedinSingle = async (linkedinUrl: string) => {
    console.log(`SCRAPE | ${linkedinUrl}`)
    try {
      const html = await ky(linkedinUrl, {
          headers: {
            referer: referers[Math.floor(Math.random() * referers.length)],
            'user-agent': new UserAgent({ deviceCategory: 'desktop' }).toString()
          },
          retry: {
            backoffLimit: 10_000,
            limit: 2,
            statusCodes: [408, 413, 429, 451, 500, 502, 503, 504, 999]
          },
          timeout: 10_000
        }).text(),
        jsonLd = load(html)('script[type="application/ld+json"]').first().html()
      if (!jsonLd) return { success: true }
      const raw = (
        JSON.parse(jsonLd) as {
          '@graph'?: {
            '@context'?: string
            '@type'?: string
          }[]
        }
      )['@graph']?.find(i => i['@type'] === 'Organization')
      if (!raw) return { success: true }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { '@context': _0, '@type': _1, ...info } = raw
      return { info, success: true }
    } catch {
      return { success: false }
    }
  },
  // eslint-disable-next-line max-statements
  linkedinBatch = async (
    linkedinUrls: string[],
    { concurrency = 10, delayMs = 200, maxRetries = 2, retryDelayMs = 5000 } = {}
  ) => {
    const data: Record<string, object> = {},
      noWebsite: string[] = []
    let pending = [...linkedinUrls]
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      if (attempt > 0) {
        console.log(`Retry ${attempt}/${maxRetries} for ${pending.length} failed URLs`)
        await sleep(retryDelayMs)
      }
      const failed: string[] = []
      await pMap(
        pending,
        async url => {
          await sleep(Math.random() * delayMs)
          const result = await linkedinSingle(url)
          if (!result.success) failed.push(url)
          else if (result.info) data[url] = result.info
          else noWebsite.push(url)
        },
        { concurrency }
      )
      pending = failed
      if (pending.length === 0) break
    }
    return { data, noWebsite, scrapeFailed: pending }
  }

export default linkedinBatch
