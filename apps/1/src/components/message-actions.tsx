/** biome-ignore-all lint/nursery/noFloatingPromises: x */

import type { Vote } from '@a/db/schema'

import { MessageAction, MessageActions } from '@a/ui/ai-elements/message'
import { Copy, ThumbsDown, ThumbsUp } from 'lucide-react'
import { memo } from 'react'
import equal from 'react-fast-compare'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import { useCopyToClipboard } from 'usehooks-ts'

import type { ChatMessage } from '~/types'

const PureMessageActions = ({
  chatId,
  isLoading,
  message,
  vote
}: {
  chatId: string
  isLoading: boolean
  message: ChatMessage
  vote?: Vote
}) => {
  const { mutate } = useSWRConfig(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [_, copyToClipboard] = useCopyToClipboard()
  if (isLoading) return null
  const textFromParts = message.parts
      .filter(p => p.type === 'text')
      .map(p => p.text)
      .join('\n')
      .trim(),
    handleCopy = async () => {
      if (!textFromParts) {
        toast.error("There's no text to copy!")
        return
      }
      await copyToClipboard(textFromParts)
      toast.success('Copied to clipboard!')
    }
  return (
    <MessageActions className='-ml-1 gap-0 -space-x-1'>
      {/* eslint-disable-next-line @typescript-eslint/strict-void-return */}
      <MessageAction onClick={handleCopy} tooltip='Copy'>
        <Copy />
      </MessageAction>
      <MessageAction
        disabled={vote?.isUpvoted}
        onClick={() => {
          const upvote = fetch('/api/vote', {
            body: JSON.stringify({ chatId, messageId: message.id, type: 'up' }),
            method: 'PATCH'
          })
          toast.promise(upvote, {
            error: 'Failed to upvote response.',
            loading: 'Upvoting Response...',
            success: () => {
              mutate<Vote[]>(
                `/api/vote?chatId=${chatId}`,
                currentVotes => {
                  if (!currentVotes) return []
                  const votesWithoutCurrent = currentVotes.filter(currentVote => currentVote.messageId !== message.id)
                  return [...votesWithoutCurrent, { chatId, isUpvoted: true, messageId: message.id }]
                },
                { revalidate: false }
              )
              return 'Upvoted Response!'
            }
          })
        }}
        tooltip='Upvote Response'>
        <ThumbsUp />
      </MessageAction>
      <MessageAction
        disabled={vote ? !vote.isUpvoted : false}
        onClick={() => {
          const downvote = fetch('/api/vote', {
            body: JSON.stringify({ chatId, messageId: message.id, type: 'down' }),
            method: 'PATCH'
          })
          toast.promise(downvote, {
            error: 'Failed to downvote response.',
            loading: 'Downvoting Response...',
            success: () => {
              mutate<Vote[]>(
                `/api/vote?chatId=${chatId}`,
                currentVotes => {
                  if (!currentVotes) return []
                  const votesWithoutCurrent = currentVotes.filter(v => v.messageId !== message.id)
                  return [...votesWithoutCurrent, { chatId, isUpvoted: false, messageId: message.id }]
                },
                { revalidate: false }
              )
              return 'Downvoted Response!'
            }
          })
        }}
        tooltip='Downvote Response'>
        <ThumbsDown />
      </MessageAction>
    </MessageActions>
  )
}

export default memo(PureMessageActions, (prevProps, nextProps) => {
  if (!equal(prevProps.vote, nextProps.vote)) return false
  if (prevProps.isLoading !== nextProps.isLoading) return false
  return true
})
