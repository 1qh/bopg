import annot from './router/annot'
import auth from './router/auth'
import bbox from './router/bbox'
import blog from './router/blog'
import conversation from './router/conversation'
import flow from './router/flow'
import ke from './router/ke'
import llm from './router/llm'
import simpleAi from './router/simple-ai'
import solo from './router/solo'
import tts from './router/tts'
import { createRouter } from './trpc'

export const router = createRouter({ annot, auth, bbox, blog, conversation, flow, ke, llm, simpleAi, solo, tts })
export type Router = typeof router
