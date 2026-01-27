'use client'

import { Reasoning, ReasoningContent, ReasoningTrigger } from '@a/ui/ai-elements/reasoning'
import { useEffect, useState } from 'react'

interface MessageReasoningProps {
  isLoading: boolean
  reasoning: string
}

const MessageReasoning = ({ isLoading, reasoning }: MessageReasoningProps) => {
  const [hasBeenStreaming, setHasBeenStreaming] = useState(isLoading)
  useEffect(() => {
    if (isLoading) setHasBeenStreaming(true)
  }, [isLoading])
  return (
    <Reasoning defaultOpen={hasBeenStreaming} isStreaming={isLoading}>
      <ReasoningTrigger />
      <ReasoningContent>{reasoning}</ReasoningContent>
    </Reasoning>
  )
}

export default MessageReasoning
