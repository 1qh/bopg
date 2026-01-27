import { Suspense } from 'react'

import { s3 } from '~/s3'
import { HydrateClient, prefetch, trpc } from '~/trpc/server'

import Studio from './studio'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params,
    objects = (await s3.list({ prefix: `${id}/` })).contents ?? []
  prefetch(trpc.annot.tagsById.queryOptions(Number(id)))
  prefetch(trpc.bbox.byAnnot.queryOptions(Number(id)))
  return (
    <HydrateClient>
      <Suspense>
        <Studio id={Number(id)} objects={objects} />
      </Suspense>
    </HydrateClient>
  )
}

export default Page
