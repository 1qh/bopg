'use client'

import type { Vote } from '@a/db/schema'
import type { AppUsage } from 'types'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { unstable_serialize } from 'swr/infinite'

import type { Attachment, ChatMessage } from '~/types'

import ChatHeader from '~/components/chat-header'
import useAutoResume from '~/hooks/use-auto-resume'
import useChatVisibility from '~/hooks/use-chat-visibility'
import ChatSDKError from '~/lib/errors'
import { fetcher, fetchWithErrorHandlers, randomId } from '~/utils'

import type { VisibilityType } from './visibility-selector'

import { Artifact } from './artifact'
import { useDataStream } from './data-stream-provider'
import Messages from './messages'
import MultimodalInput from './multimodal-input'
import { getChatHistoryPaginationKey } from './sidebar-history'
import { toast } from './toast'

const Chat = ({
  autoResume,
  id,
  initialChatModel,
  initialLastContext,
  initialMessages,
  initialVisibilityType,
  isReadonly
}: {
  autoResume: boolean
  id: string
  initialChatModel: string
  initialLastContext?: AppUsage
  initialMessages: ChatMessage[]
  initialVisibilityType: VisibilityType
  isReadonly: boolean
}) => {
  const router = useRouter(),
    { visibilityType } = useChatVisibility({ chatId: id, initialVisibilityType }),
    { mutate } = useSWRConfig()

  useEffect(() => {
    const handlePopState = () => {
      router.refresh()
    }
    globalThis.addEventListener('popstate', handlePopState)
    return () => globalThis.removeEventListener('popstate', handlePopState)
  }, [router])

  const { setDataStream } = useDataStream(),
    [input, setInput] = useState<string>(''),
    [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext),
    [currentModelId, setCurrentModelId] = useState(initialChatModel),
    currentModelIdRef = useRef(currentModelId)

  useEffect(() => {
    currentModelIdRef.current = currentModelId
  }, [currentModelId])

  const { addToolApprovalResponse, messages, resumeStream, sendMessage, setMessages, status, stop } = useChat<ChatMessage>(
      {
        experimental_throttle: 100,
        generateId: randomId,
        id,
        messages: initialMessages,
        onData: dataPart => {
          // @ts-expect-error - x
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          setDataStream(ds => (ds ? [...ds, dataPart] : []))
          if (dataPart.type === 'data-usage') setUsage(dataPart.data as AppUsage)
        },
        onError: e => {
          if (e instanceof ChatSDKError)
            toast({
              description: e.message,
              type: 'error'
            })
        },
        onFinish: () => {
          mutate(unstable_serialize(getChatHistoryPaginationKey))
        },
        sendAutomaticallyWhen: ({ messages: currentMessages }) => {
          const lastMessage = currentMessages.at(-1),
            shouldContinue =
              lastMessage?.parts.some(
                part =>
                  'state' in part &&
                  part.state === 'approval-responded' &&
                  'approval' in part &&
                  (part.approval as { approved?: boolean }).approved === true
              ) ?? false
          return shouldContinue
        },
        // eslint-disable-next-line react-hooks/refs
        transport: new DefaultChatTransport({
          api: '/api/chat',
          fetch: fetchWithErrorHandlers as typeof fetch,
          prepareSendMessagesRequest: req => {
            const lastMessage = req.messages.at(-1),
              isToolApprovalContinuation =
                lastMessage?.role !== 'user' ||
                req.messages.some(msg =>
                  msg.parts.some(p => {
                    const { state } = p as { state?: string }
                    return state === 'approval-responded' || state === 'output-denied'
                  })
                )
            return {
              body: {
                id: req.id,
                ...(isToolApprovalContinuation ? { messages: req.messages } : { message: lastMessage }),
                selectedChatModel: currentModelIdRef.current,
                selectedVisibilityType: visibilityType,
                ...req.body
              }
            }
          }
        })
      }
    ),
    searchParams = useSearchParams(),
    query = searchParams.get('query'),
    [hasAppendedQuery, setHasAppendedQuery] = useState(false)

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        parts: [{ text: query, type: 'text' }],
        role: 'user' as const
      })
      setHasAppendedQuery(true)
      globalThis.history.replaceState({}, '', `/chat/${id}`)
    }
  }, [query, sendMessage, hasAppendedQuery, id])

  const { data: votes } = useSWR<Vote[]>(messages.length >= 2 ? `/api/vote?chatId=${id}` : null, fetcher),
    [attachments, setAttachments] = useState<Attachment[]>([])

  useAutoResume({ autoResume, initialMessages, resumeStream, setMessages })
  return (
    <>
      <div className='flex h-dvh min-w-0 touch-pan-y flex-col overscroll-contain bg-background'>
        <ChatHeader chatId={id} isReadonly={isReadonly} selectedVisibilityType={initialVisibilityType} />
        <Messages
          addToolApprovalResponse={addToolApprovalResponse}
          chatId={id}
          isReadonly={isReadonly}
          messages={messages}
          status={status}
          votes={votes}
        />
        {[
          'weather in Hanoi',
          'implement quick sort',
          'compose a very short song',
          'make spreadsheet of expenses',
          'write code to plot world population',
          'a minimal deep neural network in numpy'
        ].map(q => (
          <button
            className='font-light text-muted-foreground transition-all hover:font-normal hover:text-foreground'
            key={q}
            onClick={() => setInput(q)}
            type='button'>
            {q}
          </button>
        ))}
        <div className='sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl flex-col gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4'>
          {!isReadonly && (
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              onModelChange={setCurrentModelId}
              selectedModelId={currentModelId}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              // eslint-disable-next-line @typescript-eslint/strict-void-return
              stop={stop}
              usage={usage}
            />
          )}
        </div>
      </div>
      <Artifact
        addToolApprovalResponse={addToolApprovalResponse}
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        selectedModelId={currentModelId}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />
    </>
  )
}

export default Chat
