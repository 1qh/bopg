import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

import env from '~/env'

export default createOpenAICompatible({ baseURL: env.OPENAI_BASE_URL, name: '' })
