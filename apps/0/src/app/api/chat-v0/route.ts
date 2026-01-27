import type { UIMessage } from 'ai'

import { convertToModelMessages, streamText } from 'ai'

import openai from '~/openai'

const POST = async (request: Request) => {
  const { messages, model } = (await request.json()) as { messages: UIMessage[]; model: string }
  return streamText({
    messages: await convertToModelMessages(messages),
    model: openai(model)
  }).toUIMessageStreamResponse()
}

export { POST }
