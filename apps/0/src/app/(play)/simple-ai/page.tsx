import { Suspense } from 'react'

import { getSession } from '~/auth/server'
import { HydrateClient, prefetch, trpc } from '~/trpc/server'

import Create from './common/create'
import FlowTemplates from './flow-templates'
import List from './list'

const Page = async () => {
  const viewerId = (await getSession())?.user.id
  prefetch(trpc.simpleAi.all.queryOptions())
  return (
    <>
      <p className='h-[2vh]' />
      <HydrateClient>
        <Suspense fallback={<p className='mx-auto size-8 animate-spin rounded-full border-2 border-t-transparent' />}>
          <List viewerId={viewerId} />
          <FlowTemplates />
        </Suspense>
      </HydrateClient>
      <Create buttonText='new agent' className='z-2 hover:gap-0.5' />
    </>
  )
}

export default Page
