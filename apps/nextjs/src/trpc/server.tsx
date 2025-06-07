import type { Router } from '@a/api'

import { createCaller, createTRPCContext, router } from '@a/api'
import { auth } from '@a/auth'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'

import { createQueryClient } from './query-client'

const ctx = cache(async () => {
    const heads = new Headers(await headers())
    heads.set('x-trpc-source', 'rsc')
    return createTRPCContext({
      headers: heads,
      session: await auth()
    })
  }),
  api = createCaller(ctx),
  queryClient = cache(createQueryClient),
  trpc = createTRPCOptionsProxy<Router>({ ctx, queryClient, router })

export { api, trpc }
