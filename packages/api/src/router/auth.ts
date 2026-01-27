import type { TRPCRouterRecord } from '@trpc/server'

import { authProcedure as p, publicProcedure } from '../trpc'

export default {
  getSecretMessage: p.query(() => 'you can see this secret message!'),
  getSession: publicProcedure.query(({ ctx }) => ctx.session)
} satisfies TRPCRouterRecord
