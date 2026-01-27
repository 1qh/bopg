'use server'

import type { UIMessage } from 'ai'

import { generateText } from 'ai'

import type { VisibilityType } from '~/components/visibility-selector'

import { oac } from '~/ai/providers'
import { updateChatVisibilityById } from '~/lib/db'

import { titlePrompt } from './ai/prompts'

export const generateTitleFromUserMessage = async (message: UIMessage) => {
    const { text } = await generateText({
      model: oac('qwen3-vl:4b-instruct'),
      prompt: JSON.stringify(message),
      system: titlePrompt
    })
    return text.trim()
  },
  updateChatVisibility = async ({ chatId, visibility }: { chatId: string; visibility: VisibilityType }) => {
    await updateChatVisibilityById({ chatId, visibility })
  }
