/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: x */

import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@a/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@a/ui/tooltip'
import { memo, useState } from 'react'
import { toast } from 'sonner'

import type { UIArtifact } from './artifact'
import type { ArtifactActionContext } from './create-artifact'

import { artifactDefinitions } from './artifact'

interface ArtifactActionsProps {
  artifact: UIArtifact
  currentVersionIndex: number
  handleVersionChange: (type: 'latest' | 'next' | 'prev' | 'toggle') => void
  isCurrentVersion: boolean
  metadata: any
  mode: 'diff' | 'edit'
  setMetadata: Dispatch<SetStateAction<any>>
}

const PureArtifactActions = ({
  artifact,
  currentVersionIndex,
  handleVersionChange,
  isCurrentVersion,
  metadata,
  mode,
  setMetadata
}: ArtifactActionsProps) => {
  const [isLoading, setIsLoading] = useState(false),
    artifactDefinition = artifactDefinitions.find(d => d.kind === artifact.kind)
  if (!artifactDefinition) throw new Error('Artifact definition not found!')
  const actionContext: ArtifactActionContext = {
    content: artifact.content,
    currentVersionIndex,
    handleVersionChange,
    isCurrentVersion,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    metadata,
    mode,
    setMetadata
  }
  return artifactDefinition.actions.map(a => (
    <Tooltip key={a.description}>
      <TooltipTrigger asChild>
        <Button
          disabled={
            isLoading || artifact.status === 'streaming' ? true : a.isDisabled ? a.isDisabled(actionContext) : false
          }
          // eslint-disable-next-line @typescript-eslint/strict-void-return
          onClick={async () => {
            setIsLoading(true)
            try {
              await Promise.resolve(a.onClick(actionContext))
            } catch {
              toast.error('Failed to execute action')
            } finally {
              setIsLoading(false)
            }
          }}
          size='icon'
          variant='ghost'>
          {a.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{a.description}</TooltipContent>
    </Tooltip>
  ))
}

export default memo(PureArtifactActions, (prevProps, nextProps) => {
  if (prevProps.artifact.status !== nextProps.artifact.status) return false
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) return false
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false
  if (prevProps.artifact.content !== nextProps.artifact.content) return false
  return true
})
