/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'

import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

import type { UIArtifact } from '~/components/artifact'

type Selector<T> = (state: UIArtifact) => T

export const initialArtifactData: UIArtifact = {
    boundingBox: { height: 0, left: 0, top: 0, width: 0 },
    content: '',
    documentId: 'init',
    isVisible: false,
    kind: 'text',
    status: 'idle',
    title: ''
  },
  useArtifact = () => {
    const { data: localArtifact, mutate: setLocalArtifact } = useSWR<UIArtifact>('artifact', null, {
        fallbackData: initialArtifactData
      }),
      artifact = useMemo(() => localArtifact ?? initialArtifactData, [localArtifact]),
      setArtifact = useCallback(
        (updaterFn: ((currentArtifact: UIArtifact) => UIArtifact) | UIArtifact) => {
          setLocalArtifact(currentArtifact => {
            const artifactToUpdate = currentArtifact ?? initialArtifactData
            if (typeof updaterFn === 'function') return updaterFn(artifactToUpdate)
            return updaterFn
          })
        },
        [setLocalArtifact]
      ),
      { data: localArtifactMetadata, mutate: setLocalArtifactMetadata } = useSWR(
        () => (artifact.documentId ? `artifact-metadata-${artifact.documentId}` : null),
        null,
        { fallbackData: null }
      )
    return useMemo(
      () => ({
        artifact,
        metadata: localArtifactMetadata,
        setArtifact,
        setMetadata: setLocalArtifactMetadata
      }),
      [artifact, setArtifact, localArtifactMetadata, setLocalArtifactMetadata]
    )
  },
  useArtifactSelector = <Selected>(selector: Selector<Selected>) => {
    const { data: localArtifact } = useSWR<UIArtifact>('artifact', null, { fallbackData: initialArtifactData }),
      selectedValue = useMemo(() => selector(localArtifact ?? initialArtifactData), [localArtifact, selector])
    return selectedValue
  }
