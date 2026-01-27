import type { Node, XYPosition } from '@xyflow/react'

import { ulid } from 'ulid'

import type { FlowNode } from './types'

const NODES_CONFIG: Partial<Record<FlowNode['type'], { requiredTargets: FlowNode['type'][] }>> = {
  LLM: { requiredTargets: ['prompt'] }
}
type Model = (typeof MODELS)[number]
const MODELS = ['gemma3:12b', 'qwen3:8b', 'deepseek-r1:8b', 'llama4:16x17b'] as const

type LlmNode = Node<
  {
    model: Model
    tools: {
      description?: string
      id: string
      name: string
    }[]
  },
  'LLM'
>
type PromptNode = Node<{ text: string }, 'prompt'>
type ResponseNode = Node<{ text?: string }, 'response'>
type TemplateNode = Node<
  {
    tags: {
      id: string
      tag: string
    }[]
    text: string
  },
  'template'
>
const defaultData: Record<FlowNode['type'], FlowNode['data']> = {
    LLM: { model: 'gemma3:12b', tools: [] },
    prompt: { text: '' },
    response: {},
    template: { tags: [], text: '' }
  },
  createNode = (type: FlowNode['type'], position: XYPosition) =>
    ({
      data: defaultData[type],
      id: ulid(),
      position,
      type
    }) as FlowNode

export { createNode, MODELS, NODES_CONFIG }

export type { LlmNode, Model, PromptNode, ResponseNode, TemplateNode }
