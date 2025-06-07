/* eslint-disable max-statements */
import type { FlowNode } from './workflow'
import type { CycleError, MissingConnectionError, MultipleSourcesError, WorkflowDefinition } from './workflow'
export interface EdgeExecutionState {
  error?: CycleError | MultipleSourcesError
}
export interface NodeExecutionState {
  error?: MissingConnectionError | ProcessingNodeError
  sources?: Record<string, string>
  status: NodeExecutionStatus
  targets?: Record<string, string>
  timestamp: string
}
export type NodeExecutionStatus = 'error' | 'idle' | 'processing' | 'success'
export type NodeProcessor = (node: FlowNode, targetsData: ProcessedData) => Promise<ProcessedData>
export type ProcessedData = Record<string, string> | undefined
export interface ProcessingNodeError {
  message: string
  type: 'processing-node'
}
interface ExecutionContext {
  processNode: (nodeId: string, targetsData: ProcessedData) => Promise<ProcessedData>
  updateNodeExecutionState: (nodeId: string, state: Partial<NodeExecutionState>) => void
  workflow: WorkflowDefinition
}
export const createWorkflowExecutionEngine = (context: ExecutionContext) => {
  const completedNodes = new Set<string>(),
    failedNodes = new Set<string>(),
    processingNodes = new Set<string>(),
    getNodeTargetsData = (workflow: WorkflowDefinition, nodeId: string): ProcessedData => {
      const node = workflow.nodes.find(n => n.id === nodeId)
      if (!node) return undefined
      const edgesConnectedToNode = workflow.edges.filter(edge => edge.target === nodeId),
        targetsData: ProcessedData = {}
      for (const edge of edgesConnectedToNode) {
        const sourceNode = workflow.nodes.find(n => n.id === edge.source)
        if (sourceNode?.data.executionState?.sources) {
          const sourceNodeResult = sourceNode.data.executionState.sources[edge.sourceHandle]
          if (sourceNodeResult) targetsData[edge.targetHandle] = sourceNodeResult
        }
      }
      return targetsData
    },
    checkBranchNodeStatus = (nodeId: string): NodeExecutionStatus => {
      const node = context.workflow.nodes.find(n => n.id === nodeId)
      if (!node) return 'idle'
      if (processingNodes.has(nodeId)) return 'processing'
      if (failedNodes.has(nodeId)) return 'error'
      const dependencies = context.workflow.dependencies[nodeId] ?? []
      if (dependencies.length === 0) {
        if (completedNodes.has(nodeId) && node.data.executionState?.sources) return 'success'
        return 'idle'
      }
      for (const dep of dependencies) {
        const depStatus = checkBranchNodeStatus(dep.node)
        if (depStatus === 'processing' || depStatus === 'error') return depStatus
      }
      if (completedNodes.has(nodeId) && node.data.executionState?.sources) return 'success'
      return 'idle'
    },
    getBranchStatus = (nodeId: string, handleId: string): NodeExecutionStatus => {
      const node = context.workflow.nodes.find(n => n.id === nodeId)
      if (!node) return 'idle'
      const incomingEdges = context.workflow.edges.filter(edge => edge.target === nodeId && edge.targetHandle === handleId)
      for (const edge of incomingEdges) {
        const branchStatus = checkBranchNodeStatus(edge.source)
        if (branchStatus !== 'idle') return branchStatus
      }
      return 'idle'
    },
    canProcessNode = (nodeId: string) => {
      const node = context.workflow.nodes.find(n => n.id === nodeId)
      if (!node) return false
      if (node.type === 'prompt-crafter') {
        const targetHandles = node.data.dynamicHandles['template-tags'].map(handle => handle.id),
          branchStatuses = targetHandles.map(handleId => getBranchStatus(nodeId, handleId)),
          allBranchesComplete = branchStatuses.every(status => status === 'success'),
          hasProcessingBranch = branchStatuses.some(status => status === 'processing')
        return allBranchesComplete && !hasProcessingBranch
      }
      const nodeDependencies = context.workflow.dependencies[nodeId] ?? []
      return nodeDependencies.every(dep => {
        if (failedNodes.has(dep.node)) return false
        const sourceNode = context.workflow.nodes.find(n => n.id === dep.node)
        if (!sourceNode?.data.executionState?.sources) return false
        const sourceHandleData = sourceNode.data.executionState.sources[dep.sourceHandle]
        return completedNodes.has(dep.node) && sourceHandleData !== undefined
      })
    },
    processNode = async (nodeId: string) => {
      try {
        const targetsData = getNodeTargetsData(context.workflow, nodeId)
        context.updateNodeExecutionState(nodeId, {
          status: 'processing',
          targets: targetsData,
          timestamp: new Date().toISOString()
        })
        const result = await context.processNode(nodeId, targetsData)
        context.updateNodeExecutionState(nodeId, {
          sources: result,
          status: 'success',
          targets: targetsData,
          timestamp: new Date().toISOString()
        })
        completedNodes.add(nodeId)
        processingNodes.delete(nodeId)
      } catch (error) {
        context.updateNodeExecutionState(nodeId, {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            type: 'processing-node'
          },
          status: 'error',
          timestamp: new Date().toISOString()
        })
        console.error(error)
        processingNodes.delete(nodeId)
        failedNodes.add(nodeId)
      }
    }
  return {
    execute: async (executionOrder: string[]) => {
      completedNodes.clear()
      failedNodes.clear()
      processingNodes.clear()
      while (completedNodes.size + failedNodes.size < executionOrder.length) {
        const availableNodes = executionOrder.filter(
          nodeId =>
            !(completedNodes.has(nodeId) || failedNodes.has(nodeId) || processingNodes.has(nodeId)) &&
            canProcessNode(nodeId)
        )
        if (availableNodes.length === 0)
          if (processingNodes.size > 0)
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => setTimeout(resolve, 100))
          else break
        const processingPromises = availableNodes.map(async nodeId => {
          processingNodes.add(nodeId)
          return processNode(nodeId)
        })
        // eslint-disable-next-line no-await-in-loop
        await Promise.race(processingPromises)
      }
    }
  }
}
