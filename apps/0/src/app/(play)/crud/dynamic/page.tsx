import { HydrateClient, prefetch, trpc } from '~/trpc/server'

import Client from './client'

const Page = () => {
  prefetch(trpc.blog.all.queryOptions())
  return (
    <HydrateClient>
      <Client />
    </HydrateClient>
  )
}

export default Page
