import type { Router } from '@a/api'
import type { FetchInfiniteQueryOptions } from '@tanstack/react-query'
import type { ResolverDef, TRPCQueryOptions } from '@trpc/tanstack-react-query'
import type { ReactNode } from 'react'

import { router, trpcContext } from '@a/api'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'

import { auth } from '~/auth/server'

import client from './client'

const ctx = cache(async () => {
    const heads = new Headers(await headers())
    heads.set('x-trpc-source', 'rsc')
    return trpcContext({ auth, headers: heads })
  }),
  api = router.createCaller(ctx),
  queryClient = cache(client),
  trpc = createTRPCOptionsProxy<Router>({ ctx, queryClient, router }),
  HydrateClient = ({ children }: { children: ReactNode }) => (
    <HydrationBoundary state={dehydrate(queryClient())}>{children}</HydrationBoundary>
  ),
  prefetch = (opt: ReturnType<TRPCQueryOptions<ResolverDef>>) => {
    const q = queryClient()
    if (opt.queryKey[1]?.type === 'infinite') q.prefetchInfiniteQuery(opt as unknown as FetchInfiniteQueryOptions)
    else q.prefetchQuery(opt)
  }

export { api, HydrateClient, prefetch, trpc }
