import { eq } from '@a/db'
import db from '@a/db/client'
import { Bbox as B } from '@a/db/schema'
import { sleep } from 'utils'

import { boxesDetectFn, classifyImageFn } from '~/action'
import { VLM_MODEL } from '~/constant'
import { url2b64 } from '~/utils'

const jobs = {
  classifyImage: async ({ id, tags }: { id: string; tags: string[] }) => {
    console.log('start job - box', id)
    const box = await db.query.Bbox.findFirst({ where: eq(B.id, id) })
    console.log('found - box', id)
    if (!box) return false
    const predict = await classifyImageFn({ b64: url2b64(box.src), model: VLM_MODEL, tags })
    if (!predict.length) return false
    console.log('predict - box', id, predict)
    await db.update(B).set({ predict }).where(eq(B.id, id))
    console.log('job completed - box', id)
    return true
  },
  detectBoxes: async (path: string) => {
    console.log('start job - detectBoxed', path)
    await boxesDetectFn(path)
    return true
  },
  greet: async ({ text }: { text: string }) => {
    await sleep(text.length * 1000)
    return `hello ${text}`
  }
} satisfies Record<string, (data: never) => Promise<unknown>>

export default jobs
