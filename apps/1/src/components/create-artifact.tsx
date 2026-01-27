/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-member-accessibility */
/** biome-ignore-all lint/suspicious/noExplicitAny: x */
import type { Suggestion } from '@a/db/schema'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { DataUIPart } from 'ai'
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react'

import type { ChatMessage, CustomUIDataTypes } from '~/types'

import type { UIArtifact } from './artifact'

interface ArtifactAction<M = any> {
  description: string
  icon: ReactNode
  isDisabled?: (context: ArtifactActionContext<M>) => boolean
  onClick: (context: ArtifactActionContext<M>) => Promise<void> | void
}

interface ArtifactActionContext<M = any> {
  content: string
  currentVersionIndex: number
  handleVersionChange: (type: 'latest' | 'next' | 'prev' | 'toggle') => void
  isCurrentVersion: boolean
  metadata: M
  mode: 'diff' | 'edit'
  setMetadata: Dispatch<SetStateAction<M>>
}

interface ArtifactConfig<T extends string, M = any> {
  actions: ArtifactAction<M>[]
  content: ComponentType<ArtifactContent<M>>
  description: string
  initialize?: (parameters: InitializeParameters<M>) => void
  kind: T
  onStreamPart: (args: {
    setArtifact: Dispatch<SetStateAction<UIArtifact>>
    setMetadata: Dispatch<SetStateAction<M>>
    // @ts-expect-error: x
    streamPart: DataUIPart<CustomUIDataTypes>
  }) => void
  toolbar: ArtifactToolbarItem[]
}

interface ArtifactContent<M = any> {
  content: string
  currentVersionIndex: number
  getDocAt: (index: number) => string
  isCurrentVersion: boolean
  isInline: boolean
  isLoading: boolean
  metadata?: M
  mode: 'diff' | 'edit'
  onSaveContent: (updatedContent: string, debounce: boolean) => void
  setMetadata: Dispatch<SetStateAction<M>>
  status: 'idle' | 'streaming'
  suggestions: Suggestion[]
  title: string
}

interface ArtifactToolbarContext {
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
}

interface ArtifactToolbarItem {
  description: string
  icon: ReactNode
  onClick: (context: ArtifactToolbarContext) => void
}

interface InitializeParameters<M = any> {
  documentId: string
  setMetadata: Dispatch<SetStateAction<M>>
}

export class Artifact<T extends string, M = any> {
  readonly actions: ArtifactAction<M>[]
  readonly content: ComponentType<ArtifactContent<M>>
  readonly description: string
  readonly initialize?: (parameters: InitializeParameters) => void
  readonly kind: T
  readonly onStreamPart: (args: {
    setArtifact: Dispatch<SetStateAction<UIArtifact>>
    setMetadata: Dispatch<SetStateAction<M>>
    // @ts-expect-error: x
    streamPart: DataUIPart<CustomUIDataTypes>
  }) => void
  readonly toolbar: ArtifactToolbarItem[]

  constructor(config: ArtifactConfig<T, M>) {
    this.kind = config.kind
    this.description = config.description
    this.content = config.content
    this.actions = config.actions
    this.toolbar = config.toolbar
    this.initialize = config.initialize ?? (() => ({}))
    this.onStreamPart = config.onStreamPart
  }
}

export type { ArtifactActionContext, ArtifactToolbarItem }
