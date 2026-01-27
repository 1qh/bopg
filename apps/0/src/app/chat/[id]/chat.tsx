'use client'

import type { Convo } from '@a/db/schema'

import { Conversation, ConversationContent, ConversationScrollButton } from '@a/ui/ai-elements/conversation'
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from '@a/ui/ai-elements/message'
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@a/ui/ai-elements/prompt-input'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { isEqual } from 'es-toolkit'
import { Copy, RefreshCcw } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import MessageReasoning from '~/components/message-reasoning'

const Chat = ({ id, messages: _messages, own, title }: Convo & { own?: boolean }) => {
  const begun = useRef(false),
    [input, setInput] = useState(''),
    { messages, regenerate, sendMessage, status } = useChat({
      id,
      messages: _messages,
      transport: new DefaultChatTransport({ api: '/api/chat-db' })
    }),
    isStreaming = status === 'streaming'

  useEffect(() => {
    if (!(begun.current || messages.length)) {
      begun.current = true
      sendMessage({ text: title })
    }
  }, [])
  return (
    <div className='flex h-dvh grow flex-col pb-2'>
      <Conversation>
        <ConversationContent className='mx-auto max-w-3xl gap-0'>
          {messages.map(({ id: mId, parts, role }, index) => (
            <Message className='p-0' from={role} key={mId}>
              <MessageContent className='group-[.is-user]:rounded-3xl!'>
                {parts.map((p, i) => {
                  const key = `${mId}${i}`,
                    isLastMessage = index === messages.length - 1
                  if (p.type === 'reasoning')
                    return (
                      <MessageReasoning isLoading={isStreaming ? isLastMessage : false} key={key} reasoning={p.text} />
                    )
                  if (p.type === 'text')
                    return (
                      <Fragment key={key}>
                        <MessageResponse>{p.text}</MessageResponse>
                        {role === 'assistant' ? (
                          <MessageActions>
                            <MessageAction
                              label='Copy'
                              onClick={() => {
                                navigator.clipboard.writeText(p.text)
                                toast.success('Copied to clipboard')
                              }}>
                              <Copy />
                            </MessageAction>
                            {isLastMessage && own ? (
                              <MessageAction
                                label='Retry'
                                onClick={() => {
                                  regenerate()
                                }}>
                                <RefreshCcw />
                              </MessageAction>
                            ) : null}
                          </MessageActions>
                        ) : null}
                      </Fragment>
                    )
                  if (isEqual(p, { type: 'step-start' })) return null
                  return JSON.stringify(p, null, 2)
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {own ? (
        <PromptInput
          className='mx-auto max-w-3xl *:rounded-3xl'
          onSubmit={(_, e) => {
            if (isStreaming) {
              toast.error('Please wait for the response to finish')
              return
            }
            e.preventDefault()
            sendMessage({ text: input })
            setInput('')
          }}>
          <PromptInputTextarea
            className='min-h-26 p-5 text-base!'
            onChange={e => setInput(e.currentTarget.value)}
            placeholder='Ask anything'
            value={input}
          />
          <PromptInputSubmit className='absolute right-2 bottom-2 rounded-full' disabled={!input.trim()} status='ready' />
        </PromptInput>
      ) : null}
    </div>
  )
}

export default Chat
