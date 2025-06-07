import { nanoid } from 'nanoid'

import type { GenerateTextNodeControllerType } from './generate-text-node-controller'
import type { PromptCrafterNodeControllerType } from './prompt-crafter-node-controller'
import type { TextInputNodeControllerType } from './text-input-node-controller'
import type { VisualizeTextNodeControllerType } from './visualize-text-node-controller'
import type { FlowNode } from './workflow'

export interface NodePosition {
  x: number
  y: number
}

export const nodeFactory = {
  'generate-text': (position: NodePosition): GenerateTextNodeControllerType => ({
    data: { config: { model: 'llama-3.1-8b-instant' }, dynamicHandles: { tools: [] } },
    id: nanoid(),
    position,
    type: 'generate-text'
  }),
  'prompt-crafter': (position: NodePosition): PromptCrafterNodeControllerType => ({
    data: { config: { template: '' }, dynamicHandles: { 'template-tags': [] } },
    id: nanoid(),
    position,
    type: 'prompt-crafter'
  }),
  'text-input': (position: NodePosition): TextInputNodeControllerType => ({
    data: { config: { value: '' } },
    height: 300,
    id: nanoid(),
    position,
    type: 'text-input',
    width: 350
  }),
  'visualize-text': (position: NodePosition): VisualizeTextNodeControllerType => ({
    data: {},
    height: 300,
    id: nanoid(),
    position,
    type: 'visualize-text',
    width: 350
  })
}

export const createNode = (nodeType: NonNullable<FlowNode['type']>, position: NodePosition): FlowNode =>
  nodeFactory[nodeType](position)
