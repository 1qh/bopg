'use client'

import { Input } from '@a/ui/input'
import { Progress } from '@a/ui/progress'
import { useAtom } from 'jotai/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { JobRes } from '~/types'

import { getJobs, postJobs } from '~/job-utils'
import { jobIdsAtom } from '~/store'

const Page = () => {
  const [csv, setCsv] = useState(''),
    [ids, setIds] = useAtom(jobIdsAtom),
    [jobs, setJobs] = useState<JobRes[] | undefined>(),
    progress = jobs ? (100 * jobs.filter(j => j.state === 'completed').length) / jobs.length : null,
    fetchJobs = async () => {
      if (!ids.length) return
      setJobs(await getJobs(ids.join(',')))
    },
    submit = async () => {
      const newIds = await postJobs({
        name: 'greet',
        payloads: csv
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
          .map(v => ({ text: v }))
      })
      setIds(p => [...p, ...newIds])
      setCsv('')
    }

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (!ids.length) return
    const t = setInterval(() => {
      fetchJobs()
    }, 1000)
    return () => clearInterval(t)
  }, [ids])

  useEffect(() => {
    if (jobs?.every(j => j.state === 'completed')) {
      setIds([])
      setJobs(undefined)
      toast.success('All jobs completed')
    }
  }, [jobs])

  return (
    <div className='mb-10 ml-2'>
      <pre className='text-xs'>{JSON.stringify(jobs, null, 2)}</pre>
      <Input
        className='my-3 w-96'
        onChange={e => setCsv(e.target.value)}
        onKeyDown={e => {
          if (csv.trim() && !e.shiftKey && e.key === 'Enter') submit()
        }}
        placeholder='Enter names, comma-separated'
        value={csv}
      />
      {progress ? <Progress className='w-96' value={progress} /> : null}
    </div>
  )
}
export default Page
