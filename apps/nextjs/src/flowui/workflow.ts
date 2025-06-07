/* eslint-disable @typescript-eslint/max-params */
/* eslint-disable max-depth */
/* eslint-disable max-statements */
import { nanoid } from 'nanoid'

import type { GenerateTextNodeControllerType } from './generate-text-node-controller'
import type { PromptCrafterNodeControllerType } from './prompt-crafter-node-controller'
import type { StatusEdgeControllerType } from './status-edge-controller'
import type { TextInputNodeControllerType } from './text-input-node-controller'
import type { VisualizeTextNodeControllerType } from './visualize-text-node-controller'
export type ConnectionMap = Map<string, FlowEdge[]>
export interface CycleError {
  edges: EdgeErrorInfo[]
  message: string
  type: 'cycle'
}
export interface DependencyGraph {
  dependencies: Map<string, { node: string; sourceHandle: string }[]>
  dependents: Map<string, { node: string; targetHandle: string }[]>
}
export interface DynamicHandle {
  description?: string
  id: string
  name: string
}
export interface MissingConnectionError {
  message: string
  node: NodeErrorInfo
  type: 'missing-required-connection'
}
export interface MultipleSourcesError {
  edges: EdgeErrorInfo[]
  message: string
  type: 'multiple-sources-for-target-handle'
}
export interface WorkflowDefinition {
  dependencies: Dependencies
  dependents: Dependents
  edges: FlowEdge[]
  errors: WorkflowError[]
  executionOrder: string[]
  id: string
  nodes: FlowNode[]
}
export type WorkflowError = CycleError | MissingConnectionError | MultipleSourcesError
type Dependencies = Record<string, Dependency[]>
interface Dependency {
  node: string
  sourceHandle: string
}
interface Dependent {
  node: string
  targetHandle: string
}
type Dependents = Record<string, Dependent[]>
interface EdgeErrorInfo {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
}
interface NodeErrorInfo {
  handleId: string
  id: string
}
const NODES_CONFIG: Partial<Record<NonNullable<FlowNode['type']>, { requiredTargets: string[] }>> = {
  'generate-text': { requiredTargets: ['prompt'] }
}
export type FlowEdge = StatusEdgeControllerType
export type FlowNode =
  | GenerateTextNodeControllerType
  | PromptCrafterNodeControllerType
  | TextInputNodeControllerType
  | VisualizeTextNodeControllerType
export const isNodeOfType = <T extends FlowNode['type']>(
  node: FlowNode,
  type: T
): node is Extract<FlowNode, { type: T }> => node.type === type
export const isNodeWithDynamicHandles = <T extends FlowNode>(
  node: T
): node is Extract<T, { data: { dynamicHandles: Record<string, DynamicHandle[]> } }> => 'dynamicHandles' in node.data
const buildDependencyGraph = (
    edges: FlowEdge[]
  ): {
    connectionMap: ConnectionMap
    dependencies: DependencyGraph['dependencies']
    dependents: DependencyGraph['dependents']
  } => {
    const dependencies = new Map<string, { node: string; sourceHandle: string }[]>(),
      dependents = new Map<string, { node: string; targetHandle: string }[]>(),
      connectionMap = new Map<string, FlowEdge[]>()
    for (const edge of edges) {
      const targetKey = `${edge.target}-${edge.targetHandle}`,
        existingConnections = connectionMap.get(targetKey) ?? []
      connectionMap.set(targetKey, [...existingConnections, edge])
      const existingDependencies = dependencies.get(edge.target) ?? []
      dependencies.set(edge.target, [
        ...existingDependencies,
        {
          node: edge.source,
          sourceHandle: edge.sourceHandle
        }
      ])
      const existingDependents = dependents.get(edge.source) ?? []
      dependents.set(edge.source, [
        ...existingDependents,
        {
          node: edge.target,
          targetHandle: edge.targetHandle
        }
      ])
    }
    return { connectionMap, dependencies, dependents }
  },
  topologicalSort = (
    nodes: FlowNode[],
    dependencies: DependencyGraph['dependencies'],
    dependents: DependencyGraph['dependents']
  ): string[] => {
    const indegree = new Map<string, number>(),
      queue: string[] = [],
      executionOrder: string[] = []
    for (const node of nodes) {
      const degree = dependencies.get(node.id)?.length ?? 0
      indegree.set(node.id, degree)
      if (degree === 0) queue.push(node.id)
    }
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode) {
        executionOrder.push(currentNode)
        const nodesDependentOnCurrent = dependents.get(currentNode) ?? []
        for (const dependent of nodesDependentOnCurrent) {
          const currentDegree = indegree.get(dependent.node)
          if (typeof currentDegree === 'number') {
            const newDegree = currentDegree - 1
            indegree.set(dependent.node, newDegree)
            if (newDegree === 0) queue.push(dependent.node)
          }
        }
      }
    }
    return executionOrder
  },
  validateMultipleSources = (connectionMap: ConnectionMap): MultipleSourcesError[] => {
    const errors: MultipleSourcesError[] = []
    connectionMap.forEach((edges, targetKey) => {
      if (edges.length > 1) {
        const [targetNode, targetHandle] = targetKey.split('-')
        errors.push({
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            sourceHandle: edge.sourceHandle,
            target: edge.target,
            targetHandle: edge.targetHandle
          })),
          message: `Target handle "${targetHandle}" on node "${targetNode}" has ${edges.length} sources.`,
          type: 'multiple-sources-for-target-handle'
        })
      }
    })
    return errors
  },
  detectCycles = (
    nodes: FlowNode[],
    dependencies: DependencyGraph['dependencies'],
    dependents: DependencyGraph['dependents'],
    edges: FlowEdge[]
  ): CycleError[] => {
    const executionOrder = topologicalSort(nodes, dependencies, dependents)
    if (executionOrder.length === nodes.length) return []
    const indegree = new Map<string, number>(),
      queue: string[] = []
    for (const node of nodes) {
      const degree = dependencies.get(node.id)?.length ?? 0
      indegree.set(node.id, degree)
      if (degree === 0) queue.push(node.id)
    }
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode) {
        const nodesDependentOnCurrent = dependents.get(currentNode) ?? []
        for (const dependent of nodesDependentOnCurrent) {
          const currentDegree = indegree.get(dependent.node)
          if (typeof currentDegree === 'number') {
            const newDegree = currentDegree - 1
            indegree.set(dependent.node, newDegree)
            if (newDegree === 0) queue.push(dependent.node)
          }
        }
      }
    }
    const cycleNodes = Array.from(indegree.entries())
        .filter(([_, degree]) => degree > 0)
        .map(([nodeId]) => nodeId),
      cycleEdges = edges.filter(edge => cycleNodes.includes(edge.source) && cycleNodes.includes(edge.target))
    if (cycleEdges.length === 0) return []
    const error: CycleError = {
      edges: cycleEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle
      })),
      message: `Workflow contains cycles between nodes: ${cycleNodes.join(', ')}`,
      type: 'cycle'
    }
    return [error]
  },
  validateRequiredHandles = (nodes: FlowNode[], edges: FlowEdge[]): MissingConnectionError[] => {
    const errors: MissingConnectionError[] = [],
      connectionsByTarget = new Map<string, FlowEdge[]>(),
      connectionsBySource = new Map<string, FlowEdge[]>()
    for (const edge of edges) {
      const targetKey = `${edge.target}-${edge.targetHandle}`,
        sourceKey = `${edge.source}-${edge.sourceHandle}`,
        targetConnections = connectionsByTarget.get(targetKey) ?? []
      connectionsByTarget.set(targetKey, [...targetConnections, edge])
      const sourceConnections = connectionsBySource.get(sourceKey) ?? []
      connectionsBySource.set(sourceKey, [...sourceConnections, edge])
    }
    for (const node of nodes)
      if (node.type) {
        const config = NODES_CONFIG[node.type]
        if (config?.requiredTargets.length)
          for (const targetHandle of config.requiredTargets) {
            const key = `${node.id}-${targetHandle}`,
              connections = connectionsByTarget.get(key)
            if (!connections || connections.length === 0)
              errors.push({
                message: `Node "${node.id}" requires a connection to its "${targetHandle}" input.`,
                node: {
                  handleId: targetHandle,
                  id: node.id
                },
                type: 'missing-required-connection'
              })
          }
      }
    return errors
  }
export const prepareWorkflow = (nodes: FlowNode[], edges: FlowEdge[]): WorkflowDefinition => {
  const errors: WorkflowError[] = [],
    { connectionMap, dependencies, dependents } = buildDependencyGraph(edges)
  errors.push(...validateMultipleSources(connectionMap))
  const cycleErrors = detectCycles(nodes, dependencies, dependents, edges)
  errors.push(...cycleErrors)
  errors.push(...validateRequiredHandles(nodes, edges))
  const executionOrder = cycleErrors.length === 0 ? topologicalSort(nodes, dependencies, dependents) : []
  return {
    dependencies: Object.fromEntries(dependencies),
    dependents: Object.fromEntries(dependents),
    edges,
    errors,
    executionOrder,
    id: nanoid(),
    nodes
  }
}
