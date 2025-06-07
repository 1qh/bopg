import { authRouter } from './router/auth'
import { postRouter } from './router/post'
import { createTRPCRouter } from './trpc'

export const router = createTRPCRouter({
  auth: authRouter,
  post: postRouter
})

export type Router = typeof router
