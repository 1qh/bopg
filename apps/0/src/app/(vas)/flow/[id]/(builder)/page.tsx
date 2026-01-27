import { Settings } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import Tutip from '~/components/tutip'
import { HydrateClient, prefetch, trpc } from '~/trpc/server'

import Flow from './flow'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  prefetch(trpc.flow.byId.queryOptions(id))
  return (
    <HydrateClient>
      <Tutip side='left' tooltip='Settings'>
        <Link className='fixed top-1 right-1 z-1' href={`/flow/${id}/settings`}>
          <Settings className='size-8 rounded-lg stroke-1 p-1.5 transition-all duration-200 hover:bg-background hover:stroke-2' />
        </Link>
      </Tutip>
      <Suspense>
        <Flow />
      </Suspense>
    </HydrateClient>
  )
}

export default Page
