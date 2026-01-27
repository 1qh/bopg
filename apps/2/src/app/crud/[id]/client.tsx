'use client'

import type { api } from '@a/cv'
import type { Preloaded } from 'convex/react'

import { usePreloadedQuery } from 'convex/react'

import { Author } from '../common'

interface ClientProps {
  preloaded: Preloaded<typeof api.blog.read>
}
const Client = ({ preloaded }: ClientProps) => {
  const blog = usePreloadedQuery(preloaded)
  if (!blog) return <p className='text-muted-foreground'>Blog not found</p>
  if (!(blog.own || blog.published)) return <p className='text-muted-foreground'>Blog not published</p>
  return (
    <>
      <Author {...blog} />
      <p className='mt-2 text-3xl font-bold'>{blog.title}</p>
      <p className='whitespace-pre-line'>{blog.content.trim()}</p>
    </>
  )
}

export default Client
