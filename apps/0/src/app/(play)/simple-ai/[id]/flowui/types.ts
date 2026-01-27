/* eslint-disable @typescript-eslint/max-params */
import type { Connection, Edge, EdgeChange, NodeChange, XYPosition } from '@xyflow/react'

import type { LlmNode, PromptNode, ResponseNode, TemplateNode } from './node-factory'

type ConnectionMap = Map<string, FlowEdge[]>
interface CycleError {
  edges: EdgeInfo[]
  message: string
  type: 'cycle'
}
type Dependencies = Record<string, Dependency[]>
interface Dependency {
  node: string
  sourceHandle: string
}
interface DependencyGraph {
  dependencies: Map<string, { node: string; sourceHandle: string }[]>
  dependents: Map<string, { node: string; targetHandle: string }[]>
}
interface Dependent {
  node: string
  targetHandle: string
}
type Dependents = Record<string, Dependent[]>
type EdgeError = CycleError | MultipleSourcesError
type EdgeInfo = Pick<FlowEdge, 'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'>
interface FlowDefinition {
  dependencies: Dependencies
  dependents: Dependents
  edges: FlowEdge[]
  errors: FlowError[]
  executionOrder: string[]
  id: string
  nodes: FlowNode[]
}
type FlowEdge = Edge<{ error?: EdgeError }>
type FlowError = CycleError | MissingConnectionError | MultipleSourcesError
type FlowNode = (LlmNode | PromptNode | ResponseNode | TemplateNode) & { state?: NodeState }
interface FlowStore {
  addHandle: (nodeId: string, nodeType: FlowNode['type'], key: string, handle: object) => string
  createNode: (nodeType: FlowNode['type'], position: XYPosition) => FlowNode
  deleteHandle: (nodeId: string, nodeType: FlowNode['type'], key: string, handleId: string) => void
  deleteNode: (id: string) => void
  edges: FlowEdge[]
  errors: FlowError[]
  getNodeById: (nodeId: string) => FlowNode
  init: (nodes: FlowNode[], edges: FlowEdge[]) => void
  nodes: FlowNode[]
  onConnect: (con: Connection) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  saved: boolean
  setSaved: () => void
  updateEdgeError: (edgeId: string, error?: Partial<EdgeError>) => void
  updateNode: (id: string, nodeType: FlowNode['type'], data: Partial<FlowNode['data']>) => void
  updateNodeState: (nodeId: string, state?: Partial<NodeState>) => void
  validate: () => FlowDefinition
}
interface MissingConnectionError {
  message: string
  node: {
    handleId: string
    id: string
  }
  type: 'missing-required-connection'
}
interface MultipleSourcesError {
  edges: EdgeInfo[]
  message: string
  type: 'multiple-sources-for-target-handle'
}
interface NodeState {
  error?: MissingConnectionError
  sources?: Record<string, string>
  targets?: Record<string, string>
  timestamp?: number
}

export type {
  ConnectionMap,
  CycleError,
  DependencyGraph,
  FlowDefinition,
  FlowEdge,
  FlowError,
  FlowNode,
  FlowStore,
  MissingConnectionError,
  MultipleSourcesError,
  NodeState
}
