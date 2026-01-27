import type { RouterOutputs } from '@a/api'

import { format, formatDistance } from 'date-fns'
import { UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import Delete from './delete'
import Update from './update'

type Blog = RouterOutputs['blog']['all'][number]

const Author = ({ content, createdAt, id, own, title, user }: Blog) => (
    <div className='flex items-center'>
      {user.image ? (
        <Image alt='' className='rounded-full' height={36} src={user.image} width={36} />
      ) : (
        <UserRound className='size-9 shrink-0 rounded-full bg-border stroke-1 pt-1 text-background' />
      )}
      <div className='ml-3'>
        {user.name}
        <p className='text-xs text-muted-foreground group-hover:hidden'>
          {formatDistance(createdAt, new Date(), { addSuffix: true })}
        </p>
        <p className='hidden text-xs text-muted-foreground group-hover:block'>{format(createdAt, 'PPPPpp')}</p>
      </div>
      <p className='grow' />
      {own ? (
        <>
          <Update {...{ content, id, title }} />
          <Delete id={id} />
        </>
      ) : null}
    </div>
  ),
  Card = (props: Blog) => {
    const { content, id, title } = props
    return (
      <div className='group -mt-0.5 w-full rounded-xs border-2 border-transparent px-2.5 pt-2 transition-all duration-300 hover:rounded-3xl hover:border-border'>
        <Author {...props} />
        <Link className='*:ml-1' href={`/crud/${id}`}>
          <p className='mt-1 text-xl font-medium'>{title}</p>
          <p className='line-clamp-3 text-xs text-muted-foreground'>{content}</p>
        </Link>
        <hr className='mx-3 mt-2.5 translate-y-px transition-all duration-500 group-hover:opacity-0' />
      </div>
    )
  },
  List = ({ blogs }: { blogs: Blog[] }) => (blogs.length ? blogs.map(b => <Card key={b.id} {...b} />) : 'No blog yet')

export { Author, List }
