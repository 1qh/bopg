import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { Router } from './root'

import { router } from './root'
import { createCallerFactory, createTRPCContext } from './trpc'

const createCaller = createCallerFactory(router)
type RouterInputs = inferRouterInputs<Router>
type RouterOutputs = inferRouterOutputs<Router>

export { createCaller, createTRPCContext, router }
export type { Router, RouterInputs, RouterOutputs }
