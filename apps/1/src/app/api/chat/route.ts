// oxlint-disable always-return, catch-or-return, prefer-await-to-then, group-exports
/* eslint-disable no-await-in-loop, max-statements, complexity */
/** biome-ignore-all lint/nursery/noFloatingPromises: x */
/** biome-ignore-all lint/performance/noAwaitInLoops: x */
import type { DBMessage } from '@a/db/schema'
import type { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import type { ResumableStreamContext } from 'resumable-stream'
import type { ModelCatalog } from 'tokenlens/core'
import type { AppUsage } from 'types'

import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText
} from 'ai'
import { unstable_cache as cache } from 'next/cache'
import { after } from 'next/server'
import { createResumableStreamContext } from 'resumable-stream'
import { fetchModels, getUsage } from 'tokenlens'

import type { ChatMessage } from '~/types'

import { generateTitleFromUserMessage } from '~/actions'
import entitlementsByUserType from '~/ai/entitlements'
import { artifactsPrompt } from '~/ai/prompts'
import myProvider from '~/ai/providers'
import createDocument from '~/ai/tools/create-document'
import getWeather from '~/ai/tools/get-weather'
import requestSuggestions from '~/ai/tools/request-suggestions'
import updateDocument from '~/ai/tools/update-document'
import { getSession } from '~/auth/server'
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatLastContextById,
  updateChatTitleById,
  updateMessage
} from '~/lib/db'
import ChatSDKError from '~/lib/errors'
import { convertToUIMessages, randomId } from '~/utils'

import type { PostRequestBody } from './schema'

import { postRequestBodySchema } from './schema'

export const maxDuration = 60

const DEFAULT_TITLE = 'New chat'

let globalStreamContext: null | ResumableStreamContext = null

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels()
    } catch (error) {
      console.warn('TokenLens: catalog fetch failed, using default catalog', error)
    }
  },
  ['tokenlens-catalog'],
  { revalidate: 24 * 60 * 60 }
)

export const DELETE = async (request: Request) => {
  const { searchParams } = new URL(request.url),
    id = searchParams.get('id')
  if (!id) return new ChatSDKError('bad_request:api').toResponse()
  const session = await getSession()
  if (!session?.user) return new ChatSDKError('unauthorized:chat').toResponse()

  const chat = await getChatById({ id })

  if (chat?.userId !== session.user.id) return new ChatSDKError('forbidden:chat').toResponse()

  const deletedChat = await deleteChatById({ id })

  return Response.json(deletedChat, { status: 200 })
}

export const getStreamContext = () => {
  if (!globalStreamContext)
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after
      })
    } catch (error) {
      if ((error as Error).message.includes('REDIS_URL'))
        console.log(' > Resumable streams are disabled due to missing REDIS_URL')
      else console.error(error)
    }

  return globalStreamContext
}

export const POST = async (request: Request) => {
  let requestBody: PostRequestBody

  try {
    const json = (await request.json()) as unknown
    requestBody = postRequestBodySchema.parse(json)
  } catch {
    return new ChatSDKError('bad_request:api').toResponse()
  }

  try {
    const { id, message, messages, selectedChatModel, selectedVisibilityType } = requestBody,
      s = await getSession()

    if (!s?.user) return new ChatSDKError('unauthorized:chat').toResponse()
    const { session, user } = s,
      userType = user.isAnonymous ? 'guest' : 'regular',
      messageCount = await getMessageCountByUserId({
        differenceInHours: 24,
        id: user.id
      })

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay)
      return new ChatSDKError('rate_limit:chat').toResponse()

    const isToolApprovalFlow = Boolean(messages),
      chat = await getChatById({ id })
    let messagesFromDb: DBMessage[] = [],
      titlePromise: null | Promise<string> = null

    if (chat) {
      if (chat.userId !== user.id) return new ChatSDKError('forbidden:chat').toResponse()

      if (!isToolApprovalFlow) messagesFromDb = await getMessagesByChatId({ id })
    } else if (message?.role === 'user') {
      const [part] = message.parts,
        title = part?.type === 'text' && part.text.trim().length < 30 ? part.text.trim() : DEFAULT_TITLE

      await saveChat({
        id,
        title,
        userId: user.id,
        visibility: selectedVisibilityType
      })
      titlePromise = title === DEFAULT_TITLE ? generateTitleFromUserMessage(message) : null
    }

    const uiMessages = isToolApprovalFlow
      ? (messages as ChatMessage[])
      : [...convertToUIMessages(messagesFromDb), message as ChatMessage]

    if (message?.role === 'user')
      await saveMessages([
        {
          chatId: id,
          id: message.id,
          parts: message.parts,
          role: 'user'
        }
      ])

    const streamId = randomId()
    await createStreamId({ chatId: id, streamId })

    let finalMergedUsage: AppUsage | undefined
    const stream = createUIMessageStream({
        execute: async ({ writer: dataStream }) => {
          if (titlePromise !== null)
            titlePromise.then(title => {
              updateChatTitleById({ chatId: id, title })
              dataStream.write({ data: title, type: 'data-chat-title' })
            })

          const isReasoningModel = selectedChatModel.includes('reasoning') || selectedChatModel.includes('thinking'),
            result = streamText({
              experimental_activeTools: isReasoningModel
                ? []
                : ['getWeather', 'createDocument', 'updateDocument', 'requestSuggestions'],

              experimental_transform: isReasoningModel ? undefined : smoothStream({ chunking: 'word' }),
              messages: await convertToModelMessages(uiMessages),
              model: myProvider.languageModel(selectedChatModel),
              onFinish: async ({ usage }) => {
                try {
                  const providers = await getTokenlensCatalog(),
                    { modelId } = myProvider.languageModel(selectedChatModel)
                  if (!modelId) {
                    finalMergedUsage = usage
                    dataStream.write({ data: finalMergedUsage, type: 'data-usage' })
                    return
                  }
                  if (!providers) {
                    finalMergedUsage = usage
                    dataStream.write({ data: finalMergedUsage, type: 'data-usage' })
                    return
                  }
                  const summary = getUsage({ modelId, providers, usage })
                  finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage
                  dataStream.write({ data: finalMergedUsage, type: 'data-usage' })
                } catch (error) {
                  console.warn('TokenLens enrichment failed', error)
                  finalMergedUsage = usage
                  dataStream.write({ data: finalMergedUsage, type: 'data-usage' })
                }
              },
              providerOptions: {
                google: {
                  thinkingConfig: {
                    includeThoughts: true,
                    thinkingLevel: 'high'
                  }
                } satisfies GoogleGenerativeAIProviderOptions
              },
              stopWhen: stepCountIs(5),
              system: selectedChatModel === 'chat-model' ? artifactsPrompt : '',
              tools: {
                createDocument: createDocument({ dataStream, session }),
                getWeather,
                requestSuggestions: requestSuggestions({
                  dataStream,
                  session
                }),
                updateDocument: updateDocument({ dataStream, session })
              }
            })

          result.consumeStream()

          dataStream.merge(
            result.toUIMessageStream({
              sendReasoning: true
            })
          )
        },
        generateId: randomId,
        onError: () => 'Oops, an error occurred!',
        onFinish: async ({ messages: finishedMessages }) => {
          if (isToolApprovalFlow)
            for (const finishedMsg of finishedMessages) {
              const existingMsg = uiMessages.find(m => m.id === finishedMsg.id)
              if (existingMsg)
                await updateMessage({
                  id: finishedMsg.id,
                  parts: finishedMsg.parts
                })
              else
                await saveMessages([
                  {
                    chatId: id,
                    id: finishedMsg.id,
                    parts: finishedMsg.parts,
                    role: finishedMsg.role
                  }
                ])
            }
          else if (finishedMessages.length > 0)
            await saveMessages(
              finishedMessages.map(currentMessage => ({
                attachments: [],
                chatId: id,
                id: currentMessage.id,
                parts: currentMessage.parts,
                role: currentMessage.role
              }))
            )
          if (finalMergedUsage)
            try {
              await updateChatLastContextById({ chatId: id, context: finalMergedUsage })
            } catch (error) {
              console.warn('Unable to persist last usage for chat', id, error)
            }
        },
        originalMessages: isToolApprovalFlow ? uiMessages : undefined
      }),
      streamContext = getStreamContext()

    if (streamContext)
      try {
        const resumableStream = await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream())
        )
        if (resumableStream) return new Response(resumableStream)
      } catch (error) {
        console.error('Failed to create resumable stream:', error)
      }

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()))
  } catch (error) {
    if (error instanceof ChatSDKError) return error.toResponse()
    console.error('Unhandled error in chat API:', error)
    return new ChatSDKError('offline:chat').toResponse()
  }
}
