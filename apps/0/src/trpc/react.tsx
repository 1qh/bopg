// oxlint-disable unicorn/no-typeof-undefined
'use client'

import type { Router } from '@a/api'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchStreamLink, loggerLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import transformer from 'superjson'

import env from '~/env'

import client from './client'

let queryClientSingleton: QueryClient | undefined

const getBaseUrl = () => {
    if (typeof globalThis.window !== 'undefined') return globalThis.location.origin
    if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`
    // eslint-disable-next-line no-restricted-properties
    return `http://localhost:${process.env.PORT ?? 3000}`
  },
  getQueryClient = () => {
    if (typeof globalThis.window === 'undefined') return client()
    queryClientSingleton ??= client()
    return queryClientSingleton
  },
  { TRPCProvider, useTRPC: api } = createTRPCContext<Router>(),
  TRPCReactProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = getQueryClient(),
      [trpcClient] = useState(() =>
        createTRPCClient<Router>({
          links: [
            loggerLink({
              enabled: op => env.NODE_ENV === 'development' || (op.direction === 'down' && op.result instanceof Error)
            }),
            httpBatchStreamLink({
              headers: () => {
                const hd = new Headers()
                hd.set('x-trpc-source', 'nextjs-react')
                return hd
              },
              transformer,
              url: `${getBaseUrl()}/api/trpc`
            })
          ]
        })
      )
    return (
      <QueryClientProvider client={queryClient}>
        <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
          {children}
        </TRPCProvider>
      </QueryClientProvider>
    )
  }

export { api, TRPCReactProvider }
