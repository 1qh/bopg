/* eslint-disable max-statements, @typescript-eslint/max-params */
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { ulid } from 'ulid'
import { create } from 'zustand'

import type { FlowEdge, FlowNode, FlowStore } from './types'

import { createNode } from './node-factory'
import { prepareFlow } from './utils'

const useFlow = create<FlowStore>((set, get) => ({
  addHandle: (nodeId, type, _key, handle) => {
    console.log('addHandle', { _key, handle, nodeId, type })
    const newId = ulid()
    set({
      nodes: get().nodes.map((n): FlowNode => {
        type FlowHandle = typeof n.data
        const key = _key as keyof FlowHandle
        if (n.id === nodeId && Array.isArray(n.data[key]) && n.type === type)
          return { ...n, data: { ...n.data, [key]: [...n.data[key], { ...handle, id: newId }] } } as FlowNode
        return n
      }),
      saved: false
    })
    get().validate()
    return newId
  },
  createNode: (nodeType, position) => {
    console.log('createNode', { nodeType, position })
    const newNode = createNode(nodeType, position)
    set(state => ({ nodes: [...state.nodes, newNode], saved: false }))
    get().validate()
    return newNode
  },
  deleteHandle: (nodeId, type, _key, handleId) => {
    console.log('deleteHandle', { _key, handleId, nodeId, type })
    set({
      edges: get().edges.filter(e => {
        if (e.source === nodeId && e.sourceHandle === handleId) return false
        if (e.target === nodeId && e.targetHandle === handleId) return false
        return true
      }),
      nodes: get().nodes.map((n): FlowNode => {
        type FlowHandle = typeof n.data
        const key = _key as keyof FlowHandle
        if (n.id === nodeId && Array.isArray(n.data[key]) && n.type === type)
          return {
            ...n,
            data: {
              ...n.data,
              [key]: (n.data[key] as (FlowHandle & { id: string })[]).filter(handle => handle.id !== handleId)
            }
          } as FlowNode
        return n
      }),
      saved: false
    })
    get().validate()
  },
  deleteNode: id => {
    console.log('deleteNode', id)
    set({
      edges: get().edges.filter(e => e.source !== id && e.target !== id),
      nodes: get().nodes.filter(n => n.id !== id),
      saved: false
    })
    get().validate()
  },
  edges: [],
  errors: [],
  getNodeById: nodeId => {
    const node = get().nodes.find(n => n.id === nodeId)
    if (!node) throw new Error(`Node with id ${nodeId} not found`)
    return node
  },
  init: (nodes: FlowNode[], edges: FlowEdge[]) => {
    set({ edges, nodes, saved: true })
    get().validate()
  },
  nodes: [],
  onConnect: con => {
    console.log('onConnect', con)
    const newEdge = addEdge(con, get().edges),
      sourceNode = get().getNodeById(con.source)
    if (!con.sourceHandle) throw new Error('Source handle not found')
    const sourceState = sourceNode.state
    if (sourceState?.sources) {
      const sourceHandleData = sourceState.sources[con.sourceHandle]
      if (sourceHandleData) {
        const nodes = get().nodes.map((n): FlowNode => {
          if (n.id === con.target && con.targetHandle)
            return {
              ...n,
              state: n.state
                ? { ...n.state, targets: { ...n.state.targets, [con.targetHandle]: sourceHandleData } }
                : { targets: { [con.targetHandle]: sourceHandleData }, timestamp: Date.now() }
            }
          return n
        })
        set({ nodes })
      }
    }
    set({ edges: newEdge, saved: false })
    get().validate()
  },
  onEdgesChange: changes => {
    console.log('onEdgesChange', changes)
    set({ edges: applyEdgeChanges(changes, get().edges) })
    const [change] = changes
    if (change?.type !== 'select') set({ saved: false })
    get().validate()
  },
  onNodesChange: changes => {
    const [change] = changes
    if (change?.type && !['dimensions', 'select'].includes(change.type)) {
      set({ nodes: applyNodeChanges<FlowNode>(changes, get().nodes) })
      console.log('onNodesChange', changes)
      set({ saved: false })
    }
  },
  saved: true,
  setSaved: () => set({ saved: true }),
  updateEdgeError: (edgeId, error) =>
    set(current => ({
      edges: current.edges.map(e => {
        if (e.id === edgeId) return { ...e, error }
        return e
      })
    })),
  updateNode: (id, type, data) => {
    console.log('updateNode', { data, id, type })
    set(current => ({
      nodes: current.nodes.map((n): FlowNode => {
        if (n.id === id && n.type === type) return { ...n, data: { ...n.data, ...data } } as FlowNode
        return n
      }),
      saved: false
    }))
    get().validate()
  },
  updateNodeState: (nodeId, state) =>
    set(current => ({
      nodes: current.nodes.map((n): FlowNode => {
        if (n.id === nodeId) return { ...n, data: { ...n.data }, state: { ...n.state, ...state } } as FlowNode
        return n
      })
    })),
  validate: () => {
    document
      .elementFromPoint(globalThis.innerWidth - 1, 1)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    const { edges, nodes } = get(),
      flow = prepareFlow(nodes, edges)
    for (const edge of flow.edges) get().updateEdgeError(edge.id)
    if (flow.errors.length > 0)
      for (const error of flow.errors)
        switch (error.type) {
          case 'cycle':
          case 'multiple-sources-for-target-handle':
            for (const edge of error.edges) get().updateEdgeError(edge.id, error)
            break
          case 'missing-required-connection':
            get().updateNodeState(error.node.id, { error, timestamp: Date.now() })
            break
          default:
            console.warn('Unhandled flow error type:', error)
        }
    set({ errors: flow.errors })
    return flow
  }
}))

export default useFlow
