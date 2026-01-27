'use client'

import type { Document } from '@a/db/schema'

import { Button } from '@a/ui/button'
import { Spinner } from '@a/ui/spinner'
import { isAfter } from 'date-fns'
import { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useArtifact } from '~/hooks/use-artifact'
import { getDocumentTimestampByIndex } from '~/utils'

interface VersionFooterProps {
  currentVersionIndex: number
  documents?: Document[]
  handleVersionChange: (type: 'latest' | 'next' | 'prev' | 'toggle') => void
}

const VersionFooter = ({ currentVersionIndex, documents, handleVersionChange }: VersionFooterProps) => {
  const { artifact } = useArtifact(),
    { mutate } = useSWRConfig(),
    [isMutating, setIsMutating] = useState(false)
  if (!documents) return
  return (
    <div className='absolute bottom-0 flex w-full flex-col justify-between gap-4 p-4 lg:flex-row'>
      <div>
        You are viewing a previous version
        <p className='text-xs text-muted-foreground'>Restore this version to make edits</p>
      </div>
      <div className='flex gap-4'>
        <Button
          disabled={isMutating}
          // eslint-disable-next-line @typescript-eslint/strict-void-return
          onClick={async () => {
            setIsMutating(true)
            // biome-ignore lint/nursery/noFloatingPromises: x
            mutate(
              `/api/document?id=${artifact.documentId}`,
              await fetch(
                `/api/document?id=${artifact.documentId}&timestamp=${String(
                  getDocumentTimestampByIndex(documents, currentVersionIndex)
                )}`,
                { method: 'DELETE' }
              ),
              {
                optimisticData: documents.length
                  ? documents.filter(d =>
                      isAfter(new Date(d.createdAt), new Date(getDocumentTimestampByIndex(documents, currentVersionIndex)))
                    )
                  : []
              }
            )
          }}>
          {isMutating ? <Spinner /> : null}
          Restore this version
        </Button>
        <Button onClick={() => handleVersionChange('latest')} variant='outline'>
          Back to latest version
        </Button>
      </div>
    </div>
  )
}

export default VersionFooter
