import type { Job } from 'bullmq'
import type { NextRequest } from 'next/server'

import { NextResponse as R } from 'next/server'

import type { JobReq, JobRes } from '~/types'

import { queue } from '~/queue'

export const GET = async ({ nextUrl }: NextRequest) => {
  const ids = nextUrl.searchParams.get('ids')?.split(',') ?? [],
    jobs = await Promise.all(ids.map(async id => queue.getJob(id) as Promise<Job>)),
    out = await Promise.all(
      jobs.map(
        async (j: Job): Promise<JobRes> => ({
          id: j.id,
          name: j.name,
          returnvalue: j.returnvalue,
          state: await j.getState()
        })
      )
    )
  return R.json(out)
}

export const POST = async (req: NextRequest) => {
  const { name, payloads } = (await req.json()) as JobReq,
    jobs = await queue.addBulk(payloads.map(data => ({ data, name })))
  return R.json(jobs.map(({ id }) => id))
}
