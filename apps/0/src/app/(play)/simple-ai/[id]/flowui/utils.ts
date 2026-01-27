/* eslint-disable @typescript-eslint/max-params, max-depth, max-statements */

import { ulid } from 'ulid'

import type {
  ConnectionMap,
  CycleError,
  DependencyGraph,
  FlowDefinition,
  FlowEdge,
  FlowError,
  FlowNode,
  MissingConnectionError,
  MultipleSourcesError
} from './types'

import { NODES_CONFIG } from './node-factory'

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

    for (const e of edges) {
      const targetKey = `${e.target}-${e.targetHandle}`
      connectionMap.set(targetKey, [...(connectionMap.get(targetKey) ?? []), e])
      if (e.sourceHandle)
        dependencies.set(e.target, [
          ...(dependencies.get(e.target) ?? []),
          { node: e.source, sourceHandle: e.sourceHandle }
        ])
      if (e.targetHandle)
        dependents.set(e.source, [...(dependents.get(e.source) ?? []), { node: e.target, targetHandle: e.targetHandle }])
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

    for (const n of nodes) {
      const degree = dependencies.get(n.id)?.length ?? 0
      indegree.set(n.id, degree)
      if (degree === 0) queue.push(n.id)
    }
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode) {
        executionOrder.push(currentNode)
        for (const dependent of dependents.get(currentNode) ?? []) {
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
    for (const [targetKey, edges] of connectionMap.entries())
      if (edges.length > 1) {
        const [targetNode, targetHandle] = targetKey.split('-')
        errors.push({
          edges,
          message: `Target handle "${targetHandle}" on node "${targetNode}" has ${edges.length} sources.`,
          type: 'multiple-sources-for-target-handle'
        })
      }
    return errors
  },
  detectCycles = (
    nodes: FlowNode[],
    dependencies: DependencyGraph['dependencies'],
    dependents: DependencyGraph['dependents'],
    edges: FlowEdge[]
  ): CycleError[] => {
    const executeOrder = topologicalSort(nodes, dependencies, dependents)
    if (executeOrder.length === nodes.length) return []
    const indegree = new Map<string, number>(),
      queue: string[] = []
    for (const n of nodes) {
      const degree = dependencies.get(n.id)?.length ?? 0
      indegree.set(n.id, degree)
      if (degree === 0) queue.push(n.id)
    }
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode)
        for (const dependent of dependents.get(currentNode) ?? []) {
          const currentDegree = indegree.get(dependent.node)
          if (typeof currentDegree === 'number') {
            const newDegree = currentDegree - 1
            indegree.set(dependent.node, newDegree)
            if (newDegree === 0) queue.push(dependent.node)
          }
        }
    }
    const cycleNodes = [...indegree.entries()].filter(([, degree]) => degree > 0).map(([nodeId]) => nodeId),
      cycleEdges = edges.filter(e => cycleNodes.includes(e.source) && cycleNodes.includes(e.target))
    if (cycleEdges.length === 0) return []
    const error: CycleError = {
      edges: cycleEdges,
      message: `Flow contains cycles between nodes: ${cycleNodes.join(', ')}`,
      type: 'cycle'
    }
    return [error]
  },
  validateRequiredHandles = (nodes: FlowNode[], edges: FlowEdge[]): MissingConnectionError[] => {
    const errors: MissingConnectionError[] = [],
      connectionsByTarget = new Map<string, FlowEdge[]>(),
      connectionsBySource = new Map<string, FlowEdge[]>()
    for (const e of edges) {
      const targetKey = `${e.target}-${e.targetHandle}`,
        sourceKey = `${e.source}-${e.sourceHandle}`
      connectionsByTarget.set(targetKey, [...(connectionsByTarget.get(targetKey) ?? []), e])
      connectionsBySource.set(sourceKey, [...(connectionsBySource.get(sourceKey) ?? []), e])
    }
    for (const n of nodes) {
      const config = NODES_CONFIG[n.type]
      if (config?.requiredTargets.length)
        for (const target of config.requiredTargets) {
          const key = `${n.id}-${target}`,
            connections = connectionsByTarget.get(key)
          if (!connections || connections.length === 0)
            errors.push({
              message: `Node "${n.id}" requires a connection to its "${target}" input.`,
              node: { handleId: target, id: n.id },
              type: 'missing-required-connection'
            })
        }
    }
    return errors
  },
  prepareFlow = (nodes: FlowNode[], edges: FlowEdge[]): FlowDefinition => {
    const errors: FlowError[] = [],
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
      id: ulid(),
      nodes
    }
  }

export { prepareFlow }
