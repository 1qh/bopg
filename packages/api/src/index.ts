import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { Router } from './root'

type RouterInputs = inferRouterInputs<Router>
type RouterOutputs = inferRouterOutputs<Router>

export { router } from './root'
export { trpcContext } from './trpc'
export type { Router, RouterInputs, RouterOutputs }
