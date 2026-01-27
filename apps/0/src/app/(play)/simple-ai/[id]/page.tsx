import { Suspense } from 'react'

import { HydrateClient, prefetch, trpc } from '~/trpc/server'

import Flow from './flow'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  prefetch(trpc.simpleAi.byId.queryOptions(Number(id)))
  return (
    <HydrateClient>
      <Suspense>
        <Flow id={Number(id)} />
      </Suspense>
    </HydrateClient>
  )
}

export default Page
