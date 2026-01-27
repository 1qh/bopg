import { Queue, Worker } from 'bullmq'

import type { JobName } from '~/types'

import { Q } from '~/constant'
import jobs from '~/jobs'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const worker = new Worker(Q, async ({ data, name }) => jobs[name as JobName](data), { connection: {} }),
  queue = new Queue(Q)
