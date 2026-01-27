'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useQueryState } from 'nuqs'

import BlurFade from '~/components/blur-fade'
import Input from '~/components/input'
import NoData from '~/components/no-data'
import { api } from '~/trpc/react'

import Card from './card'

const List = () => {
  const [q, setQ] = useQueryState('q', { defaultValue: '' }),
    { solo } = api(),
    { data } = useSuspenseQuery(solo.all.queryOptions()),
    solos = data.filter(
      p => p.title.toLowerCase().includes(q.toLowerCase()) || p.title.toLowerCase().includes(q.toLowerCase())
    )
  return (
    <div className='flex h-screen flex-col items-center overflow-auto pt-[1.5vh]'>
      <Input
        className='mb-3.5 w-96'
        disabled={!data.length}
        Icon={Search}
        inputClassName='rounded-full'
        onChange={e => {
          setQ(e.target.value)
        }}
        placeholder='Search'
        value={q}
      />
      {solos.length ? (
        <div className='grid w-fit grid-cols-1 gap-5 space-y-1.5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {solos.map((p, i) => (
            <BlurFade As='div' className='group relative z-2 h-24 w-72' delay={0.05 * i} key={p.id}>
              <Card key={p.id} {...p} />
            </BlurFade>
          ))}
        </div>
      ) : (
        <NoData />
      )}
    </div>
  )
}

export default List
