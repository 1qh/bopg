import type { Job, JobState } from 'bullmq'
import type { LucideIcon } from 'lucide-react'

import type jobs from '~/jobs'

type JobName = keyof typeof jobs
interface JobReq {
  name: JobName
  payloads: unknown[]
}
type JobRes = Pick<Job, 'id' | 'name' | 'returnvalue'> & { state: 'unknown' | JobState }
interface S3Object {
  Key: string
  LastModified: Date
  Size: number
}
interface Stat {
  correct: number
  count: number
  f1: number
  precision: number
  recall: number
}
interface Tab {
  href: string
  Icon: LucideIcon
  text?: string
}
export type { JobName, JobReq, JobRes, S3Object, Stat, Tab }
