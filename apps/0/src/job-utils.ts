import ky from 'ky'

import type { JobReq, JobRes } from '~/types'

export const { get, post } = ky.extend({ prefixUrl: '/api/jobs' }),
  getJobs = async (ids: string) => get('', { searchParams: { ids } }).json<JobRes[]>(),
  postJobs = async (json: JobReq) => post('', { json }).json<string[]>()
