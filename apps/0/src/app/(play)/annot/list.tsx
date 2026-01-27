'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useQueryState } from 'nuqs'

import BlurFade from '~/components/blur-fade'
import Input from '~/components/input'
import { api } from '~/trpc/react'

import Card from './card'

const List = ({ viewerId }: { viewerId?: string }) => {
  const [q, setQ] = useQueryState('q', { defaultValue: '' }),
    { annot } = api(),
    { data } = useSuspenseQuery(annot.all.queryOptions()),
    annots = data.filter(
      p => p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())
    ),
    t = useTranslations()
  return (
    <>
      <Input
        className='mx-auto mb-5 w-96'
        Icon={Search}
        inputClassName='rounded-full'
        onChange={e => {
          setQ(e.target.value)
        }}
        placeholder={`${t('search')} annot`}
        value={q}
      />
      {annots.length ? (
        <div className='mx-auto grid w-fit grid-cols-1 gap-5 space-y-1.5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {annots.map((p, i) => (
            <div
              className='group relative z-0 [transition:z-index_0ms_432ms] hover:z-2 hover:[transition:z-index_0ms_0ms]'
              key={p.id}>
              <div className='pointer-events-none fixed inset-0 z-1 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-black/60' />
              <BlurFade As='div' className='relative z-2 h-24 w-72' delay={0.05 * i} key={p.id}>
                <Card key={p.id} {...p} viewerId={viewerId} />
              </BlurFade>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center font-light text-muted-foreground'>No annots found</p>
      )}
    </>
  )
}

export default List
