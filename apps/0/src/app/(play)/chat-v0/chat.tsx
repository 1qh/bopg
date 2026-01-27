'use client'

import { Conversation, ConversationContent, ConversationScrollButton } from '@a/ui/ai-elements/conversation'
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from '@a/ui/ai-elements/message'
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@a/ui/ai-elements/prompt-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { isEqual } from 'es-toolkit'
import { Copy, RefreshCcw, SquarePen } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'

import MessageReasoning from '~/components/message-reasoning'

const Chat = ({ models }: { models: string[] }) => {
  const [input, setInput] = useState(''),
    [model, setModel] = useState<string | undefined>(),
    modelRef = useRef<string | undefined>(model),
    { messages, regenerate, sendMessage, setMessages, status } = useChat({
      // eslint-disable-next-line react-hooks/refs
      transport: new DefaultChatTransport({
        api: '/api/chat-v0',
        prepareSendMessagesRequest: r => ({ body: { messages: r.messages, model: modelRef.current } })
      })
    }),
    isStreaming = status === 'streaming'
  useEffect(() => {
    modelRef.current = model
  }, [model])

  return (
    <div className='flex h-dvh grow flex-col pb-1'>
      <div className='flex w-full items-center justify-between gap-1 pt-1 pl-1'>
        <SquarePen
          className='size-9 cursor-pointer rounded-lg stroke-1 px-2 transition-all duration-300 hover:scale-110 hover:bg-muted hover:stroke-[1.5] active:scale-75'
          onClick={() => setMessages([])}
        />
        <Select onValueChange={setModel} value={model}>
          <SelectTrigger className='border-none shadow-none'>
            <SelectValue placeholder='Select a model' />
          </SelectTrigger>
          <SelectContent>
            {models.map(m => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Conversation>
        <ConversationContent className='mx-auto max-w-3xl gap-0'>
          {messages.map(({ id, parts, role }, index) => (
            <Message className='p-0' from={role} key={id}>
              <MessageContent>
                {parts.map((p, i) => {
                  const key = `${id}${i}`,
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
                              }}>
                              <Copy />
                            </MessageAction>
                            {isLastMessage ? (
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
          {messages.length ? (
            <pre className='text-xs tracking-tighter whitespace-pre-wrap'>{JSON.stringify(messages, null, 2)}</pre>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput
        className='mx-auto max-w-3xl'
        onSubmit={(_, e) => {
          e.preventDefault()
          sendMessage({ text: input })
          setInput('')
        }}>
        <PromptInputTextarea
          disabled={isStreaming || !model}
          onChange={e => setInput(e.currentTarget.value)}
          placeholder={model ? `Ask ${model}` : 'No model selected'}
          value={input}
        />
        <PromptInputSubmit
          className='absolute right-1 bottom-1'
          disabled={!input.trim() || isStreaming || !model}
          status={status}
        />
      </PromptInput>
    </div>
  )
}

export default Chat
