import type { Vote } from '@a/db/schema'
import type { UseChatHelpers } from '@ai-sdk/react'

import { Conversation, ConversationContent, ConversationScrollButton } from '@a/ui/ai-elements/conversation'
import { Shimmer } from '@a/ui/ai-elements/shimmer'

import type { ChatMessage } from '~/types'

import { useDataStream } from './data-stream-provider'
import PreviewMessage from './message'

interface MessagesProps {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  chatId: string
  isReadonly: boolean
  messages: ChatMessage[]
  status: UseChatHelpers<ChatMessage>['status']
  votes?: Vote[]
}

const Messages = ({ addToolApprovalResponse, chatId, isReadonly, messages, status, votes }: MessagesProps) => {
  useDataStream()
  return (
    <Conversation>
      <ConversationContent className='mx-auto mt-7 max-w-4xl gap-0 px-2 py-5 lg:mt-2 lg:px-0'>
        {messages.length
          ? messages.map((m, index) => (
              <PreviewMessage
                addToolApprovalResponse={addToolApprovalResponse}
                chatId={chatId}
                isLoading={status === 'streaming' && messages.length - 1 === index}
                isReadonly={isReadonly}
                key={m.id}
                message={m}
                vote={votes ? votes.find(v => v.messageId === m.id) : undefined}
              />
            ))
          : 'Hi, how can I help you today?'}
        {status === 'submitted' &&
          !messages.some(m => m.parts.some(p => 'state' in p && p.state === 'approval-responded')) && (
            <Shimmer>Thinking...</Shimmer>
          )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

export default Messages
