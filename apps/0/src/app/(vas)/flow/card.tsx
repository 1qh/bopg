'use client'

import type { RouterOutputs } from '@a/api'

import { format, formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

type CardProps = RouterOutputs['flow']['all'][number]

const Card = ({ ava, createdAt, description, id, title }: CardProps) => (
  <Link
    className='flex h-25 w-72 items-start gap-4 overflow-hidden rounded-2xl bg-background p-4 text-sm drop-shadow-sm transition-all delay-200 duration-500 hover:h-60 hover:-translate-y-2 hover:scale-[102%] hover:shadow-lg hover:drop-shadow-xl active:scale-90 active:delay-0'
    href={`/flow/${id}`}>
    <Image
      alt=''
      className='absolute inset-0 top-1/2 -z-1 w-72 -translate-y-1/2 opacity-50 blur-2xl brightness-150 dark:brightness-50'
      height={100}
      src={`/ava/${ava}.svg`}
      width={100}
    />
    <div className='size-17 shrink-0 overflow-hidden rounded-xl'>
      <Image
        alt=''
        className='size-full drop-shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl'
        height={100}
        src={`/ava/${ava}.svg`}
        width={100}
      />
    </div>
    <div>
      <p className='-mt-1.5 text-base/5 font-medium text-balance'>{title}</p>
      <div className='h-16 -space-y-px overflow-hidden text-xs/4 font-light whitespace-pre-line text-foreground/70 transition-all delay-200 duration-500 group-hover:h-96'>
        <p className='text-[10px] text-muted-foreground/70 group-hover:hidden'>
          {formatDistance(createdAt, new Date(), { addSuffix: true })}
        </p>
        <p className='hidden text-[10px] text-muted-foreground/70 group-hover:block'>{format(createdAt, 'PPPpp')}</p>
        {description}
      </div>
    </div>
  </Link>
)

export default Card
