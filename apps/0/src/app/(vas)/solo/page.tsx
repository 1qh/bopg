import { Suspense } from 'react'

import { HydrateClient, prefetch, trpc } from '~/trpc/server'

import Create from './create'
import List from './list'

const Page = () => {
  prefetch(trpc.solo.all.queryOptions())
  return (
    <>
      <HydrateClient>
        <Suspense fallback={<p className='mx-auto size-8 animate-spin rounded-full border-2 border-t-transparent' />}>
          <List />
        </Suspense>
      </HydrateClient>
      <Create />
    </>
  )
}

export default Page
