interface ChatModel {
  description: string
  id: ModelId
  name: string
}

type ModelId = (typeof MODELS)[number]

export const MODELS = ['chat-model', 'reasoning-model'] as const,
  DEFAULT_CHAT_MODEL: ModelId = 'chat-model',
  chatModels: ChatModel[] = [
    {
      description: 'Powerful model for general-purpose conversations',
      id: 'chat-model',
      name: 'Instruct'
    },
    {
      description: 'Advanced reasoning for complex problems',
      id: 'reasoning-model',
      name: 'Reasoning'
    }
  ]

export type { ChatModel }
