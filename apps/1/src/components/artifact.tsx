/* eslint-disable @typescript-eslint/no-unsafe-assignment, complexity, max-statements */
/** biome-ignore-all lint/nursery/noFloatingPromises: x */
import type { Document, Vote } from '@a/db/schema'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { Dispatch, SetStateAction } from 'react'

import { useSidebar } from '@a/ui/sidebar'
import { formatDistance } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useState } from 'react'
import equal from 'react-fast-compare'
import useSWR, { useSWRConfig } from 'swr'
import { useDebounceCallback, useWindowSize } from 'usehooks-ts'

import type { Attachment, ChatMessage } from '~/types'

import codeArtifact from '~/artifacts/code/client'
import imageArtifact from '~/artifacts/image/client'
import sheetArtifact from '~/artifacts/sheet/client'
import textArtifact from '~/artifacts/text/client'
import { initialArtifactData, useArtifact } from '~/hooks/use-artifact'
import { fetcher } from '~/utils'

import ArtifactActions from './artifact-actions'
import ArtifactCloseButton from './artifact-close-button'
import ArtifactMessages from './artifact-messages'
import MultimodalInput from './multimodal-input'
import Toolbar from './toolbar'
import VersionFooter from './version-footer'

const artifactDefinitions = [textArtifact, codeArtifact, imageArtifact, sheetArtifact]
type ArtifactKind = (typeof artifactDefinitions)[number]['kind']

interface UIArtifact {
  boundingBox: {
    height: number
    left: number
    top: number
    width: number
  }
  content: string
  documentId: string
  isVisible: boolean
  kind: ArtifactKind
  status: 'idle' | 'streaming'
  title: string
}

const PureArtifact = ({
    addToolApprovalResponse,
    attachments,
    chatId,
    input,
    isReadonly,
    messages,
    selectedModelId,
    sendMessage,
    setAttachments,
    setInput,
    setMessages,
    status,
    stop,
    votes
  }: {
    addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
    attachments: Attachment[]
    chatId: string
    input: string
    isReadonly: boolean
    messages: ChatMessage[]
    selectedModelId: string
    sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
    setAttachments: Dispatch<SetStateAction<Attachment[]>>
    setInput: Dispatch<SetStateAction<string>>
    setMessages: UseChatHelpers<ChatMessage>['setMessages']
    status: UseChatHelpers<ChatMessage>['status']
    stop: UseChatHelpers<ChatMessage>['stop']
    votes?: Vote[]
  }) => {
    const { artifact, metadata, setArtifact, setMetadata } = useArtifact(),
      {
        data: docs,
        isLoading: isDocumentsFetching,
        mutate: mutateDocuments
      } = useSWR<Document[]>(
        artifact.documentId !== 'init' && artifact.status !== 'streaming'
          ? `/api/document?id=${artifact.documentId}`
          : null,
        fetcher
      ),
      [mode, setMode] = useState<'diff' | 'edit'>('edit'),
      [document, setDocument] = useState<Document | null>(null),
      [currentVersionIndex, setCurrentVersionIndex] = useState(-1),
      { open: isSidebarOpen } = useSidebar()

    useEffect(() => {
      if (docs?.length) {
        const mostRecentDoc = docs.at(-1)
        if (mostRecentDoc) {
          setDocument(mostRecentDoc)
          setCurrentVersionIndex(docs.length - 1)
          setArtifact(currentArtifact => ({
            ...currentArtifact,
            content: mostRecentDoc.content ?? ''
          }))
        }
      }
    }, [docs, setArtifact])

    useEffect(() => {
      mutateDocuments()
    }, [mutateDocuments])

    const { mutate } = useSWRConfig(),
      [isContentDirty, setIsContentDirty] = useState(false),
      handleContentChange = useCallback(
        (updatedContent: string) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!artifact) return
          mutate<Document[]>(
            `/api/document?id=${artifact.documentId}`,
            async currentDocs => {
              if (!currentDocs) return []
              const currentDocument = currentDocs.at(-1)
              if (!currentDocument?.content) {
                setIsContentDirty(false)
                return currentDocs
              }
              if (currentDocument.content !== updatedContent) {
                await fetch(`/api/document?id=${artifact.documentId}`, {
                  body: JSON.stringify({
                    content: updatedContent,
                    kind: artifact.kind,
                    title: artifact.title
                  }),
                  method: 'POST'
                })
                setIsContentDirty(false)
                const newDocument = {
                  ...currentDocument,
                  content: updatedContent,
                  createdAt: new Date()
                }
                return [...currentDocs, newDocument]
              }
              return currentDocs
            },
            { revalidate: false }
          )
        },
        [artifact, mutate]
      ),
      debouncedHandleContentChange = useDebounceCallback(handleContentChange, 2000),
      saveContent = useCallback(
        (updatedContent: string, debounce: boolean) => {
          if (document && updatedContent !== document.content) {
            setIsContentDirty(true)
            if (debounce) debouncedHandleContentChange(updatedContent)
            else handleContentChange(updatedContent)
          }
        },
        [document, debouncedHandleContentChange, handleContentChange]
      ),
      getDocAt = (index: number) => {
        if (!docs) return ''
        if (!docs[index]) return ''
        return docs[index].content ?? ''
      },
      handleVersionChange = (t: 'latest' | 'next' | 'prev' | 'toggle') => {
        if (!docs) return
        if (t === 'latest') {
          setCurrentVersionIndex(docs.length - 1)
          setMode('edit')
        }
        if (t === 'toggle') setMode(currentMode => (currentMode === 'edit' ? 'diff' : 'edit'))
        if (t === 'prev') {
          if (currentVersionIndex > 0) setCurrentVersionIndex(i => i - 1)
        } else if (t === 'next' && currentVersionIndex < docs.length - 1) setCurrentVersionIndex(i => i + 1)
      },
      [isToolbarVisible, setIsToolbarVisible] = useState(false),
      isCurrentVersion = docs && docs.length > 0 ? currentVersionIndex === docs.length - 1 : true,
      { height: windowHeight, width: windowWidth } = useWindowSize(),
      isMobile = windowWidth ? windowWidth < 768 : false,
      artifactDefinition = artifactDefinitions.find(definition => definition.kind === artifact.kind)

    if (!artifactDefinition) throw new Error('Artifact definition not found!')

    useEffect(() => {
      if (artifact.documentId !== 'init' && artifactDefinition.initialize)
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/strict-void-return
        artifactDefinition.initialize({ documentId: artifact.documentId, setMetadata })
    }, [artifact.documentId, artifactDefinition, setMetadata])

    useEffect(() => setArtifact(initialArtifactData), [chatId])

    return (
      <AnimatePresence>
        {artifact.isVisible ? (
          <motion.div
            animate={{ opacity: 1 }}
            className='fixed top-0 left-0 z-1 flex h-dvh w-dvw'
            exit={{ opacity: 0, transition: { delay: 0.4 } }}
            initial={{ opacity: 1 }}>
            {!isMobile && (
              <motion.div
                animate={{ right: 0, width: windowWidth }}
                className='fixed h-dvh bg-background'
                exit={{ right: 0, width: isSidebarOpen ? windowWidth - 256 : windowWidth }}
                initial={{ right: 0, width: isSidebarOpen ? windowWidth - 256 : windowWidth }}
              />
            )}
            {!isMobile && (
              <motion.div
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { damping: 30, delay: 0.1, stiffness: 300, type: 'spring' },
                  x: 0
                }}
                className='relative h-dvh w-100 shrink-0 bg-sidebar'
                exit={{ opacity: 0, scale: 1, transition: { duration: 0 }, x: 0 }}
                initial={{ opacity: 0, scale: 1, x: 10 }}>
                <AnimatePresence>
                  {!isCurrentVersion && (
                    <motion.div
                      animate={{ opacity: 1 }}
                      className='absolute top-0 left-0 h-dvh w-100'
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <div className='flex h-full flex-col items-center justify-between p-2'>
                  <ArtifactMessages
                    addToolApprovalResponse={addToolApprovalResponse}
                    chatId={chatId}
                    isReadonly={isReadonly}
                    messages={messages}
                    status={status}
                    votes={votes}
                  />
                  <MultimodalInput
                    attachments={attachments}
                    chatId={chatId}
                    input={input}
                    selectedModelId={selectedModelId}
                    sendMessage={sendMessage}
                    setAttachments={setAttachments}
                    setInput={setInput}
                    setMessages={setMessages}
                    status={status}
                    // eslint-disable-next-line @typescript-eslint/strict-void-return
                    stop={stop}
                  />
                </div>
              </motion.div>
            )}
            <motion.div
              animate={
                isMobile
                  ? {
                      borderRadius: 0,
                      height: windowHeight,
                      opacity: 1,
                      transition: {
                        damping: 30,
                        delay: 0,
                        duration: 0.8,
                        stiffness: 300,
                        type: 'spring'
                      },
                      width: windowWidth || 'calc(100dvw)',
                      x: 0,
                      y: 0
                    }
                  : {
                      borderRadius: 0,
                      height: windowHeight,
                      opacity: 1,
                      transition: {
                        damping: 30,
                        delay: 0,
                        duration: 0.8,
                        stiffness: 300,
                        type: 'spring'
                      },
                      width: windowWidth ? windowWidth - 400 : 'calc(100dvw-400px)',
                      x: 400,
                      y: 0
                    }
              }
              className='fixed flex h-dvh flex-col overflow-y-scroll'
              exit={{ opacity: 0, scale: 0.5, transition: { damping: 30, delay: 0.1, stiffness: 600, type: 'spring' } }}
              initial={{
                borderRadius: 50,
                height: artifact.boundingBox.height,
                opacity: 1,
                width: artifact.boundingBox.width,
                x: artifact.boundingBox.left,
                y: artifact.boundingBox.top
              }}>
              <div className='flex items-center px-1.5'>
                <div className='mr-auto -space-y-0.5 pt-1 pb-1.5'>
                  <div className='font-medium'>{artifact.title}</div>
                  {isContentDirty ? (
                    <div className='text-xs text-muted-foreground'>Saving changes...</div>
                  ) : document ? (
                    <div className='text-xs text-muted-foreground'>
                      {`Updated ${formatDistance(new Date(document.createdAt), new Date(), {
                        addSuffix: true
                      })}`}
                    </div>
                  ) : (
                    <div className='mt-1 h-3 w-32 animate-pulse rounded-md bg-muted-foreground/20' />
                  )}
                </div>
                <ArtifactActions
                  artifact={artifact}
                  currentVersionIndex={currentVersionIndex}
                  handleVersionChange={handleVersionChange}
                  isCurrentVersion={isCurrentVersion}
                  metadata={metadata}
                  mode={mode}
                  // eslint-disable-next-line @typescript-eslint/strict-void-return
                  setMetadata={setMetadata}
                />
                <ArtifactCloseButton />
              </div>

              <div className='h-full max-w-full! items-center overflow-y-scroll'>
                <artifactDefinition.content
                  content={isCurrentVersion ? artifact.content : getDocAt(currentVersionIndex)}
                  currentVersionIndex={currentVersionIndex}
                  getDocAt={getDocAt}
                  isCurrentVersion={isCurrentVersion}
                  isInline={false}
                  isLoading={isDocumentsFetching ? !artifact.content : false}
                  metadata={metadata}
                  mode={mode}
                  onSaveContent={saveContent}
                  setMetadata={setMetadata}
                  status={artifact.status}
                  suggestions={[]}
                  title={artifact.title}
                />
                <AnimatePresence>
                  {isCurrentVersion ? (
                    <Toolbar
                      artifactKind={artifact.kind}
                      isToolbarVisible={isToolbarVisible}
                      sendMessage={sendMessage}
                      setIsToolbarVisible={setIsToolbarVisible}
                      setMessages={setMessages}
                      status={status}
                      stop={stop}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {!isCurrentVersion && (
                  <VersionFooter
                    currentVersionIndex={currentVersionIndex}
                    documents={docs}
                    handleVersionChange={handleVersionChange}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    )
  },
  Artifact = memo(PureArtifact, (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) return false
    if (!equal(prevProps.votes, nextProps.votes)) return false
    if (prevProps.input !== nextProps.input) return false
    if (!equal(prevProps.messages, nextProps.messages.length)) return false
    return true
  })

export type { ArtifactKind, UIArtifact }
export { Artifact, artifactDefinitions }
