import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai'

import env from '~/env'

const oac = createOpenAICompatible({
    baseURL: env.OPENAI_BASE_URL,
    includeUsage: true,
    name: '',
    supportsStructuredOutputs: true
  }),
  getArtifactModel = () => oac('qwen3-vl:4b-instruct')

export default customProvider({
  languageModels: {
    'chat-model': oac('qwen3-vl:4b-instruct'),
    'reasoning-model': wrapLanguageModel({
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
      model: oac('qwen3-vl:4b-thinking')
    })
  }
})

export { getArtifactModel, oac }
