/** biome-ignore-all lint/nursery/noContinue: x */
'use client'

import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { unstable_serialize } from 'swr/infinite'

import { initialArtifactData, useArtifact } from '~/hooks/use-artifact'

import { artifactDefinitions } from './artifact'
import { useDataStream } from './data-stream-provider'
import { getChatHistoryPaginationKey } from './sidebar-history'

const DataStreamHandler = () => {
  const { dataStream, setDataStream } = useDataStream(),
    { mutate } = useSWRConfig(),
    { artifact, setArtifact, setMetadata } = useArtifact()

  useEffect(() => {
    if (!dataStream.length) return
    const newDeltas = [...dataStream]
    setDataStream([])

    for (const delta of newDeltas) {
      if (delta.type === 'data-chat-title') {
        mutate(unstable_serialize(getChatHistoryPaginationKey))
        // eslint-disable-next-line no-continue
        continue
      }
      const artifactDefinition = artifactDefinitions.find(a => a.kind === artifact.kind)
      if (artifactDefinition?.onStreamPart)
        artifactDefinition.onStreamPart({
          setArtifact,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/strict-void-return
          setMetadata,
          streamPart: delta
        })
      setArtifact(a => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!a) return { ...initialArtifactData, status: 'streaming' }
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (delta.type) {
          case 'data-clear':
            return { ...a, content: '', status: 'streaming' }
          case 'data-finish':
            return { ...a, status: 'idle' }
          case 'data-id':
            return { ...a, documentId: delta.data, status: 'streaming' }
          case 'data-kind':
            return { ...a, kind: delta.data, status: 'streaming' }
          case 'data-title':
            return { ...a, status: 'streaming', title: delta.data }
          default:
            return a
        }
      })
    }
  }, [dataStream, setArtifact, setMetadata, artifact, setDataStream, mutate])

  return null
}

export default DataStreamHandler
