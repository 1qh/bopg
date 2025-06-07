/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/max-params */
import type { Connection, EdgeChange, NodeChange } from '@xyflow/react'

import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { createWithEqualityFn } from 'zustand/traditional'

import type { DynamicHandle, FlowEdge, FlowNode, WorkflowDefinition, WorkflowError } from './workflow'
import type { EdgeExecutionState, NodeExecutionState } from './workflow-execution-engine'

import { createNode } from './node-factory'
import { isNodeOfType, isNodeWithDynamicHandles, prepareWorkflow } from './workflow'
export interface WorkflowState {
  addDynamicHandle: (
    nodeId: string,
    nodeType: FlowNode['type'],
    handleCategory: string,
    handle: Omit<DynamicHandle, 'id'>
  ) => string
  createNode: (nodeType: FlowNode['type'], position: { x: number; y: number }) => FlowNode
  deleteNode: (id: string) => void
  edges: FlowEdge[]
  getNodeById: (nodeId: string) => FlowNode
  initializeWorkflow: (nodes: FlowNode[], edges: FlowEdge[]) => void
  nodes: FlowNode[]
  onConnect: (connection: Connection) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  removeDynamicHandle: (nodeId: string, nodeType: FlowNode['type'], handleCategory: string, handleId: string) => void
  startExecution: () => Promise<{
    error?: Error
    message: string
    status: 'error' | 'success'
    validationErrors?: WorkflowError[]
  }>
  updateEdgeExecutionState: (edgeId: string, state: Partial<EdgeExecutionState> | undefined) => void
  updateNode: (id: string, nodeType: FlowNode['type'], data: Partial<FlowNode['data']>) => void
  updateNodeExecutionState: (nodeId: string, state: Partial<NodeExecutionState> | undefined) => void
  validateWorkflow: () => WorkflowDefinition
  workflowExecutionState: {
    errors: WorkflowError[]
    finishedAt: null | string
    isRunning: boolean
    timesRun: number
  }
}
const useWorkflow = createWithEqualityFn<WorkflowState>((set, get) => ({
  addDynamicHandle: (nodeId, type, handleCategory, handle) => {
    const newId = nanoid()
    set({
      nodes: get().nodes.map(node => {
        if (node.id === nodeId && isNodeWithDynamicHandles(node) && isNodeOfType(node, type))
          return {
            ...node,
            data: {
              ...node.data,
              dynamicHandles: {
                ...node.data.dynamicHandles,
                [handleCategory]: [
                  ...node.data.dynamicHandles[handleCategory as keyof typeof node.data.dynamicHandles],
                  {
                    ...handle,
                    id: newId
                  }
                ]
              }
            }
          } as FlowNode
        return node
      })
    })
    return newId
  },
  createNode: (nodeType, position) => {
    if (!nodeType) throw new Error('Node type is required to create a node')
    const newNode = createNode(nodeType, position)
    set(state => ({ nodes: [...state.nodes, newNode] }))
    return newNode
  },
  deleteNode: id =>
    set({
      edges: get().edges.filter(edge => edge.source !== id && edge.target !== id),
      nodes: get().nodes.filter(node => node.id !== id)
    }),
  edges: [],
  getNodeById: nodeId => {
    const node = get().nodes.find(n => n.id === nodeId)
    if (!node) throw new Error(`Node with id ${nodeId} not found`)
    return node
  },
  initializeWorkflow: (nodes: FlowNode[], edges: FlowEdge[]) => {
    set({ edges, nodes })
    get().validateWorkflow()
  },
  nodes: [],
  onConnect: connection => {
    const newEdge = addEdge({ ...connection, type: 'status' }, get().edges),
      sourceNode = get().getNodeById(connection.source)
    if (!connection.sourceHandle) throw new Error('Source handle not found')
    const sourceExecutionState = sourceNode.data.executionState
    if (sourceExecutionState?.sources) {
      const sourceHandleData = sourceExecutionState.sources[connection.sourceHandle]
      if (sourceHandleData) {
        const nodes = get().nodes.map(node => {
          if (node.id === connection.target && connection.targetHandle)
            return {
              ...node,
              data: {
                ...node.data,
                executionState: node.data.executionState
                  ? {
                      ...node.data.executionState,
                      targets: {
                        ...node.data.executionState.targets,
                        [connection.targetHandle]: sourceHandleData
                      }
                    }
                  : {
                      status: 'success',
                      targets: {
                        [connection.targetHandle]: sourceHandleData
                      },
                      timestamp: new Date().toISOString()
                    }
              }
            } as FlowNode
          return node
        })
        set({ nodes })
      }
    }
    set({ edges: newEdge })
    get().validateWorkflow()
  },
  onEdgesChange: changes => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
    get().validateWorkflow()
  },
  onNodesChange: changes => {
    set({ nodes: applyNodeChanges<FlowNode>(changes, get().nodes) })
    get().validateWorkflow()
  },
  removeDynamicHandle: (nodeId, type, handleCategory, handleId) => {
    set({
      edges: get().edges.filter(edge => {
        if (edge.source === nodeId && edge.sourceHandle === handleId) return false
        if (edge.target === nodeId && edge.targetHandle === handleId) return false
        return true
      }),
      nodes: get().nodes.map(node => {
        if (node.id === nodeId && isNodeWithDynamicHandles(node) && isNodeOfType(node, type)) {
          const { dynamicHandles } = node.data,
            handles = dynamicHandles[handleCategory as keyof typeof dynamicHandles] as DynamicHandle[],
            newHandles = handles.filter(handle => handle.id !== handleId)
          return {
            ...node,
            data: {
              ...node.data,
              dynamicHandles: {
                ...node.data.dynamicHandles,
                [handleCategory]: newHandles
              }
            }
          } as FlowNode
        }
        return node
      })
    })
  },
  startExecution: async () => {
    // Check if workflow has already run successfully
    if (get().workflowExecutionState.timesRun > 3) {
      const message = 'Workflow has already run successfully and cannot be run again'
      return {
        error: new Error(message),
        message,
        status: 'error'
      }
    }
    // Reset execution state for all nodes
    set(state => ({
      nodes: state.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          executionState: {
            status: 'idle',
            timestamp: new Date().toISOString()
          }
        }
      })) as FlowNode[]
    }))
    const workflow = get().validateWorkflow()
    if (workflow.errors.length > 0) {
      const message = 'Workflow validation failed'
      return {
        error: new Error(message),
        message,
        status: 'error',
        validationErrors: workflow.errors
      }
    }
    // Set execution state to running
    set(state => ({
      workflowExecutionState: {
        ...state.workflowExecutionState,
        isRunning: true
      }
    }))
    try {
      await new Promise(r => setTimeout(r, 1000))
      return {
        message: 'Workflow executed successfully',
        status: 'success'
      }
    } catch (error) {
      console.error('Workflow execution failed:', error)
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        message: 'Workflow execution failed',
        status: 'error'
      }
    } finally {
      // Reset execution state when done
      set(state => ({
        workflowExecutionState: {
          ...state.workflowExecutionState,
          isRunning: false
        }
      }))
    }
  },
  updateEdgeExecutionState: (edgeId, state) =>
    set(currentState => ({
      edges: currentState.edges.map(edge => {
        if (edge.id === edgeId)
          return {
            ...edge,
            data: {
              ...edge.data,
              executionState: {
                ...edge.data.executionState,
                ...state
              }
            }
          }
        return edge
      })
    })),
  updateNode: (id, type, data) =>
    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.id === id && isNodeOfType(node, type))
          return {
            ...node,
            data: {
              ...node.data,
              ...data
            }
          } as FlowNode
        return node
      })
    })),
  updateNodeExecutionState: (nodeId, state) =>
    set(currentState => ({
      nodes: currentState.nodes.map(node => {
        if (node.id === nodeId)
          return {
            ...node,
            data: {
              ...node.data,
              executionState: {
                ...node.data.executionState,
                ...state
              }
            }
          } as FlowNode
        return node
      })
    })),
  validateWorkflow: () => {
    const { edges, nodes } = get(),
      workflow = prepareWorkflow(nodes, edges)
    // Reset edge execution states
    for (const edge of workflow.edges)
      get().updateEdgeExecutionState(edge.id, {
        error: undefined
      })
    // Update states for errors if any
    if (workflow.errors.length > 0)
      for (const error of workflow.errors)
        switch (error.type) {
          case 'cycle':
          case 'multiple-sources-for-target-handle':
            for (const edge of error.edges)
              get().updateEdgeExecutionState(edge.id, {
                error
              })
            break
          case 'missing-required-connection':
            get().updateNodeExecutionState(error.node.id, {
              error,
              status: 'idle',
              timestamp: new Date().toISOString()
            })
            break
          default:
            console.warn('Unhandled workflow error type:', error)
        }
    set(state => ({
      workflowExecutionState: {
        ...state.workflowExecutionState,
        errors: workflow.errors
      }
    }))
    return workflow
  },
  workflowExecutionState: {
    errors: [],
    finishedAt: null,
    isRunning: false,
    timesRun: 0
  }
}))
export { useWorkflow }
