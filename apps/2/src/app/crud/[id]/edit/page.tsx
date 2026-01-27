import type { Id } from '@a/cv/model'

import { api } from '@a/cv'
import { preloadQuery } from 'convex/nextjs'

import { Client } from './client'

const Page = async ({ params }: { params: Promise<{ id: Id<'blog'> }> }) => {
  const { id } = await params,
    preloaded = await preloadQuery(api.blog.read, { id })
  return <Client preloaded={preloaded} />
}

export default Page
