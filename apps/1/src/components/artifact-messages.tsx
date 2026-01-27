import type { Vote } from '@a/db/schema'
import type { UseChatHelpers } from '@ai-sdk/react'

import { Shimmer } from '@a/ui/ai-elements/shimmer'
import { motion } from 'motion/react'
import { memo } from 'react'
import equal from 'react-fast-compare'

import type { ChatMessage } from '~/types'

import useMessages from '~/hooks/use-messages'

import PreviewMessage from './message'

interface ArtifactMessagesProps {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  chatId: string
  isReadonly: boolean
  messages: ChatMessage[]
  status: UseChatHelpers<ChatMessage>['status']
  votes?: Vote[]
}

const PureArtifactMessages = ({
    addToolApprovalResponse,
    chatId,
    isReadonly,
    messages,
    status,
    votes
  }: ArtifactMessagesProps) => {
    const {
      containerRef: messagesContainerRef,
      endRef: messagesEndRef,
      onViewportEnter,
      onViewportLeave
    } = useMessages({ status })
    return (
      <div className='flex h-full flex-col overflow-y-scroll px-1' ref={messagesContainerRef}>
        {messages.map((m, index) => (
          <PreviewMessage
            addToolApprovalResponse={addToolApprovalResponse}
            chatId={chatId}
            isLoading={status === 'streaming' && index === messages.length - 1}
            isReadonly={isReadonly}
            key={m.id}
            message={m}
            vote={votes ? votes.find(v => v.messageId === m.id) : undefined}
          />
        ))}
        {status === 'submitted' &&
          !messages.some(m => m.parts.some(p => 'state' in p && p.state === 'approval-responded')) && (
            <Shimmer>Thinking...</Shimmer>
          )}
        <motion.div
          className='min-h-6 min-w-6 shrink-0'
          onViewportEnter={onViewportEnter}
          onViewportLeave={onViewportLeave}
          ref={messagesEndRef}
        />
      </div>
    )
  },
  areEqual = (prevProps: ArtifactMessagesProps, nextProps: ArtifactMessagesProps) => {
    if (prevProps.status !== nextProps.status) return false
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (prevProps.status && nextProps.status) return false
    if (prevProps.messages.length !== nextProps.messages.length) return false
    if (!equal(prevProps.votes, nextProps.votes)) return false
    return true
  }

export default memo(PureArtifactMessages, areEqual)
