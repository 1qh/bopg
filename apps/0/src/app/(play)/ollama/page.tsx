'use client'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { useAtom } from 'jotai/react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import { chatA } from '~/action'
import { VLM_MODEL } from '~/constant'
import { messageAtom } from '~/store'

const Page = () => {
  const [messages, setMessages] = useAtom(messageAtom),
    [content, setContent] = useState(''),
    chat = useAction(chatA, {
      onError: ({ error, input }) => {
        toast.error(JSON.stringify(error))
        setContent(input.messages.at(-1)?.content ?? '')
        setMessages(p => p.slice(0, -1))
      },
      onSuccess: ({ data }) => setMessages(p => [...p, data.message])
    })

  return (
    <div className='relative flex h-screen flex-col overflow-auto pt-1 pb-16 text-sm'>
      {messages.map((m, i) => (
        <p
          className={cn(
            'whitespace-break-spaces',
            m.role === 'user' && 'my-1 mr-2 ml-auto w-fit rounded-full bg-muted px-2.5 py-1'
          )}
          key={`msg-${i}`}>
          {m.content}
        </p>
      ))}
      {chat.isPending ? <p className='animate-pulse'>Thinking...</p> : null}
      <Input
        className='fixed bottom-3 left-1/2 w-125 max-w-[calc(100%-11rem)] -translate-x-1/2 bg-background'
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => {
          if (!chat.isPending && content.trim() && !e.shiftKey && e.key === 'Enter') {
            const newMsg = { content, role: 'user' }
            setMessages(p => [...p, newMsg])
            setContent('')
            chat.execute({ messages: [...messages, newMsg], model: VLM_MODEL })
          }
        }}
        placeholder={messages.length ? 'Follow up' : 'How can I help you?'}
        type='text'
        value={content}
      />
      <Button className='absolute right-3 bottom-3' onClick={() => setMessages([])} variant='outline'>
        Clear
      </Button>
    </div>
  )
}

export default Page
