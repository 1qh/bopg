'use client'

import type { Document } from '@a/db/schema'
import type { MouseEvent, RefObject } from 'react'

import { cn } from '@a/ui'
import { Spinner } from '@a/ui/spinner'
import { FileText, Image } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import equal from 'react-fast-compare'
import useSWR from 'swr'

import { useArtifact } from '~/hooks/use-artifact'
import { fetcher } from '~/utils'

import type { ArtifactKind, UIArtifact } from './artifact'

import CodeEditor from './code-editor'
import { DocumentToolCall, DocumentToolResult } from './document'
import { ImageEditor } from './image-editor'
import { SpreadsheetEditor } from './sheet-editor'
import { Editor } from './text-editor'

interface ArtifactResult {
  id: string
  kind: ArtifactKind
  title: string
}

const PureHitboxLayer = ({
    hitboxRef,
    result,
    setArtifact
  }: {
    hitboxRef: RefObject<HTMLDivElement | null>
    result: ArtifactResult
    setArtifact: (updaterFn: ((currentArtifact: UIArtifact) => UIArtifact) | UIArtifact) => void
  }) => {
    const handleClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        const bb = event.currentTarget.getBoundingClientRect()
        setArtifact(a =>
          a.status === 'streaming'
            ? { ...a, isVisible: true }
            : {
                ...a,
                boundingBox: { height: bb.height, left: bb.x, top: bb.y, width: bb.width },
                documentId: result.id,
                isVisible: true,
                kind: result.kind,
                title: result.title
              }
        )
      },
      [setArtifact, result]
    )
    return (
      <div
        aria-hidden='true'
        className='absolute top-0 left-0 z-1 size-full rounded-xl'
        onClick={handleClick}
        ref={hitboxRef}
        role='presentation'
      />
    )
  },
  HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
    if (!equal(prevProps.result, nextProps.result)) return false
    return true
  }),
  PureDocumentHeader = ({ isStreaming, kind, title }: { isStreaming: boolean; kind?: ArtifactKind; title: string }) => (
    <div className='flex items-center gap-2 p-3 [&>svg]:stroke-1 [&>svg]:text-muted-foreground'>
      {isStreaming ? <Spinner /> : kind === 'image' ? <Image /> : <FileText />}
      {title}
    </div>
  ),
  DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
    if (prevProps.title !== nextProps.title) return false
    if (prevProps.isStreaming !== nextProps.isStreaming) return false
    return true
  }),
  DocumentContent = ({ document }: { document: Document }) => {
    const { artifact } = useArtifact(),
      containerClassName = cn('h-72 overflow-y-scroll', {
        'p-0': document.kind === 'code',
        'px-3 sm:px-10 sm:py-5': document.kind === 'text'
      }),
      commonProps = {
        content: document.content ?? '',
        currentVersionIndex: 0,
        isCurrentVersion: true,
        saveContent: () => null,
        status: artifact.status,
        suggestions: []
      }
    return (
      <div className={containerClassName}>
        {document.kind === 'text' ? (
          <Editor
            {...commonProps}
            onSaveContent={() => {
              //
            }}
          />
        ) : document.kind === 'code' ? (
          <div className='relative flex w-full flex-1'>
            <div className='absolute inset-0'>
              <CodeEditor
                {...commonProps}
                onSaveContent={() => {
                  //
                }}
              />
            </div>
          </div>
        ) : document.kind === 'sheet' ? (
          <div className='relative flex size-full flex-1 p-4'>
            <div className='absolute inset-0'>
              <SpreadsheetEditor {...commonProps} />
            </div>
          </div>
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ) : document.kind === 'image' ? (
          <ImageEditor content={document.content ?? ''} isInline status={artifact.status} title={document.title} />
        ) : null}
      </div>
    )
  }

interface DocumentPreviewProps {
  args?: {
    content?: string
    error?: string
    id?: string
    isUpdate?: boolean
    kind?: ArtifactKind
    title?: string
  }
  isReadonly: boolean
  result?: ArtifactResult
}

const DocumentPreview = ({ args, isReadonly, result }: DocumentPreviewProps) => {
  const { artifact, setArtifact } = useArtifact(),
    { data: documents, isLoading: isDocumentsFetching } = useSWR<Document[]>(
      result ? `/api/document?id=${result.id}` : null,
      fetcher
    ),
    previewDocument = useMemo(() => documents?.at(-1), [documents]),
    hitboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bb = hitboxRef.current?.getBoundingClientRect()
    if (artifact.documentId && bb)
      setArtifact(a => ({ ...a, boundingBox: { height: bb.height, left: bb.x, top: bb.y, width: bb.width } }))
  }, [artifact.documentId, setArtifact])

  if (artifact.isVisible) {
    if (result)
      return (
        <DocumentToolResult
          isReadonly={isReadonly}
          result={{ id: result.id, kind: result.kind, title: result.title }}
          type='create'
        />
      )
    if (args)
      return (
        <DocumentToolCall
          args={{
            kind: args.kind ?? 'text',
            title: args.title ?? ''
          }}
          isReadonly={isReadonly}
          type='create'
        />
      )
  }
  if (isDocumentsFetching) return <Spinner />

  const document =
    previewDocument ??
    (artifact.status === 'streaming'
      ? {
          content: artifact.content,
          createdAt: new Date(),
          id: artifact.documentId,
          kind: artifact.kind,
          title: artifact.title,
          userId: 'noop'
        }
      : null)
  if (!document) return null

  return args ? null : (
    <div className='relative my-2 w-full cursor-pointer overflow-hidden rounded-2xl border'>
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result ?? { id: '', kind: 'text', title: '' }}
        setArtifact={setArtifact}
      />
      <DocumentHeader isStreaming={artifact.status === 'streaming'} kind={document.kind} title={document.title} />
      <DocumentContent document={document} />
    </div>
  )
}

export default DocumentPreview
