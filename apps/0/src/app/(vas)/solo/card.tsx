'use client'

import type { RouterOutputs } from '@a/api'

import Flag from '@svgr-iconkit/flag-icons'
import { lang2flag } from 'constant'
import { format, formatDistance } from 'date-fns'
import Link from 'next/link'

type CardProps = RouterOutputs['solo']['all'][number]

const Card = ({ createdAt, id, language, title, user }: CardProps) => (
  <Link
    className='relative flex h-25 w-72 items-start gap-4 overflow-hidden rounded-2xl bg-background p-4 text-sm drop-shadow-sm transition-all duration-500 hover:scale-[102%] active:scale-90 active:delay-0'
    href={`/solo/${id}`}>
    <div className='size-17 min-w-17 overflow-hidden rounded-xl'>
      <Flag
        className='size-full drop-shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl'
        name={lang2flag[language]}
        variant='square'
      />
    </div>
    <div>
      <p className='-mt-1.5 text-base/5 font-medium text-balance'>{title}</p>
      <div className='h-16 -space-y-px overflow-hidden text-xs/4 font-light whitespace-pre-line text-foreground/70 transition-all duration-500 group-hover:h-96'>
        <p className='text-[10px] text-muted-foreground/70 group-hover:hidden'>
          {formatDistance(createdAt, new Date(), { addSuffix: true })}
        </p>
        <p className='hidden text-[10px] text-muted-foreground/70 group-hover:block'>{format(createdAt, 'PPpp')}</p>
        Created by {user.email}
      </div>
    </div>
  </Link>
)

export default Card
