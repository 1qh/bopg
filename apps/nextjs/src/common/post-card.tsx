'use client'

import type { RouterOutputs } from '@a/api'

import { format, formatDistance } from 'date-fns'
import Image from 'next/image'

import DeletePost from './delete-post'
import UpdatePost from './update-post'

type PostCardProps = RouterOutputs['post']['all'][number] & {
  currentUserID?: string
}

const PostCard = ({ content, createdAt, currentUserID, id, title, user }: PostCardProps) => (
  <div className='group my-2.5 w-full rounded-xl border border-transparent border-b-border p-3 transition-all duration-300 hover:border-transparent hover:bg-muted'>
    <div className='mb-2 flex items-center gap-2'>
      <Image alt='' className='rounded-full' height={24} src={user.image ?? ''} width={24} />
      {user.name}
      <p className='text-xs text-muted-foreground group-hover:hidden'>
        {formatDistance(createdAt, new Date(), { addSuffix: true })}
      </p>
      <p className='hidden text-xs text-muted-foreground group-hover:block'>{format(createdAt, 'PPPPpp')}</p>
      <p className='grow' />
      {user.id === currentUserID && (
        <>
          <UpdatePost {...{ content, id, title }} />
          <DeletePost id={id} />
        </>
      )}
    </div>
    <p className='font-medium'>{title}</p>
    <p className='text-xs'>{content}</p>
  </div>
)

export default PostCard
