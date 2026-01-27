/* eslint-disable @typescript-eslint/strict-void-return, max-statements */
'use client'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react'
import type { AppUsage } from 'types'

import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger
} from '@a/ui/ai-elements/context'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger
} from '@a/ui/ai-elements/model-selector'
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@a/ui/ai-elements/prompt-input'
import { Button } from '@a/ui/button'
import { InputGroupAddon } from '@a/ui/input-group'
import equal from 'fast-deep-equal'
import { CheckIcon, PaperclipIcon, SquareIcon } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLocalStorage, useWindowSize } from 'usehooks-ts'

import type { Attachment, ChatMessage } from '~/types'

import { chatModels, DEFAULT_CHAT_MODEL } from '~/ai/models'

import PreviewAttachment from './preview-attachment'

const setCookie = (name: string, value: string) => {
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`
  },
  PureAttachmentsButton = ({
    fileInputRef,
    selectedModelId,
    status
  }: {
    fileInputRef: RefObject<HTMLInputElement | null>
    selectedModelId: string
    status: UseChatHelpers<ChatMessage>['status']
  }) => (
    <Button
      disabled={status !== 'ready' || selectedModelId.includes('reasoning') || selectedModelId.includes('think')}
      onClick={e => {
        e.preventDefault()
        fileInputRef.current?.click()
      }}
      size='icon'
      variant='ghost'>
      <PaperclipIcon size={14} />
    </Button>
  ),
  AttachmentsButton = memo(PureAttachmentsButton),
  PureModelSelectorCompact = ({
    onModelChange,
    selectedModelId
  }: {
    onModelChange?: (modelId: string) => void
    selectedModelId: string
  }) => {
    const [open, setOpen] = useState(false),
      selectedModel =
        chatModels.find(m => m.id === selectedModelId) ??
        chatModels.find(m => m.id === DEFAULT_CHAT_MODEL) ??
        chatModels[0]
    return (
      <ModelSelector onOpenChange={setOpen} open={open}>
        <ModelSelectorTrigger asChild>
          <Button variant='ghost'>
            <ModelSelectorName>{selectedModel?.name}</ModelSelectorName>
          </Button>
        </ModelSelectorTrigger>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder='Search models...' />
          <ModelSelectorList>
            {chatModels.map(model => (
              <ModelSelectorItem
                key={model.id}
                onSelect={() => {
                  onModelChange?.(model.id)
                  setCookie('chat-model', model.id)
                  setOpen(false)
                }}
                value={model.id}>
                <ModelSelectorName>{model.name}</ModelSelectorName>
                {model.id === selectedModel?.id && <CheckIcon className='ml-auto size-4' />}
              </ModelSelectorItem>
            ))}
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    )
  },
  ModelSelectorCompact = memo(PureModelSelectorCompact),
  PureStopButton = ({
    setMessages,
    stop
  }: {
    setMessages: UseChatHelpers<ChatMessage>['setMessages']
    stop: () => void
  }) => (
    <Button
      onClick={e => {
        e.preventDefault()
        stop()
        setMessages(m => m)
      }}
      size='icon'>
      <SquareIcon size={14} />
    </Button>
  ),
  StopButton = memo(PureStopButton),
  PureMultimodalInput = ({
    attachments,
    chatId,
    input,
    onModelChange,
    selectedModelId,
    sendMessage,
    setAttachments,
    setInput,
    setMessages,
    status,
    stop,
    usage
  }: {
    attachments: Attachment[]
    chatId: string
    input: string
    onModelChange?: (modelId: string) => void
    selectedModelId: string
    sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
    setAttachments: Dispatch<SetStateAction<Attachment[]>>
    setInput: Dispatch<SetStateAction<string>>
    setMessages: UseChatHelpers<ChatMessage>['setMessages']
    status: UseChatHelpers<ChatMessage>['status']
    stop: () => void
    usage?: AppUsage
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null),
      { width } = useWindowSize(),
      adjustHeight = useCallback(() => {
        if (textareaRef.current) textareaRef.current.style.height = '44px'
      }, [])
    useEffect(() => {
      if (textareaRef.current) adjustHeight()
    }, [adjustHeight])
    const hasAutoFocused = useRef(false)
    useEffect(() => {
      if (!hasAutoFocused.current && width) {
        const timer = setTimeout(() => {
          textareaRef.current?.focus()
          hasAutoFocused.current = true
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [width])
    const resetHeight = useCallback(() => {
        if (textareaRef.current) textareaRef.current.style.height = '44px'
      }, []),
      [localStorageInput, setLocalStorageInput] = useLocalStorage('input', '')
    useEffect(() => {
      if (textareaRef.current) {
        const domValue = textareaRef.current.value,
          finalValue = domValue || localStorageInput || ''
        setInput(finalValue)
        adjustHeight()
      }
    }, [adjustHeight, localStorageInput, setInput])
    useEffect(() => {
      setLocalStorageInput(input)
    }, [input, setLocalStorageInput])
    const fileInputRef = useRef<HTMLInputElement>(null),
      [uploadQueue, setUploadQueue] = useState<string[]>([]),
      submitForm = useCallback(() => {
        if (!input.trim() && attachments.length === 0) return
        globalThis.history.pushState({}, '', `/chat/${chatId}`)
        sendMessage({
          parts: [
            ...attachments.map(a => ({
              mediaType: a.contentType,
              name: a.name,
              type: 'file' as const,
              url: a.url
            })),
            {
              text: input,
              type: 'text'
            }
          ],
          role: 'user'
        })
        setAttachments([])
        setLocalStorageInput('')
        resetHeight()
        setInput('')
        if (width && width > 768) textareaRef.current?.focus()
      }, [input, setInput, attachments, sendMessage, setAttachments, setLocalStorageInput, width, chatId, resetHeight]),
      uploadFile = useCallback(async (file: File) => {
        const fd = new FormData()
        fd.append('file', file)
        try {
          const response = await fetch('/api/files/upload', { body: fd, method: 'POST' })
          if (response.ok) {
            const data = (await response.json()) as {
                contentType: string
                pathname: string
                url: string
              },
              { contentType, pathname, url } = data
            return { contentType, name: pathname, url }
          }
          const { error } = (await response.json()) as { error: string }
          toast.error(error)
        } catch {
          toast.error('Failed to upload file, please try again!')
        }
      }, []),
      handleFileChange = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
          const files = [...(e.target.files ?? [])]
          setUploadQueue(files.map(f => f.name))
          try {
            const uploadPromises = files.map(async f => uploadFile(f)),
              uploadedAttachments = await Promise.all(uploadPromises),
              successfullyUploadedAttachments = uploadedAttachments.filter(a => a !== undefined)
            setAttachments(a => [...a, ...successfullyUploadedAttachments])
          } catch (error) {
            console.error('Error uploading files!', error)
          } finally {
            setUploadQueue([])
          }
        },
        [setAttachments, uploadFile]
      ),
      handlePaste = useCallback(
        async (event: ClipboardEvent) => {
          const items = event.clipboardData?.items
          if (!items) return
          const images = [...items].filter(i => i.type.startsWith('image/'))
          if (images.length === 0) return
          event.preventDefault()
          setUploadQueue(prev => [...prev, 'Pasted image'])
          try {
            const uploadPromises = images
                .map(f => f.getAsFile())
                .filter((f): f is File => f !== null)
                .map(async f => uploadFile(f)),
              uploadedAttachments = await Promise.all(uploadPromises),
              successfullyUploadedAttachments = uploadedAttachments.filter(a => a !== undefined)
            setAttachments(curr => [...curr, ...successfullyUploadedAttachments])
          } catch (error) {
            console.error('Error uploading pasted images:', error)
            toast.error('Failed to upload pasted image(s)')
          } finally {
            setUploadQueue([])
          }
        },
        [setAttachments, uploadFile]
      )
    useEffect(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      textarea.addEventListener('paste', handlePaste)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      return () => textarea.removeEventListener('paste', handlePaste)
    }, [handlePaste])
    return (
      <>
        <input
          className='pointer-events-none fixed -top-4 -left-4 size-0.5 opacity-0'
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          tabIndex={-1}
          type='file'
        />
        <PromptInput
          className='*:rounded-2xl'
          onSubmit={(_, e) => {
            e.preventDefault()
            if (status === 'ready') submitForm()
            else toast.error('Please wait for the model to finish its response!')
          }}>
          {(attachments.length > 0 || uploadQueue.length > 0) && (
            <div className='flex items-end gap-2 overflow-x-scroll'>
              {attachments.map(a => (
                <PreviewAttachment
                  attachment={a}
                  key={a.url}
                  onRemove={() => {
                    setAttachments(prev => prev.filter(at => at.url !== a.url))
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                />
              ))}
              {uploadQueue.map(filename => (
                <PreviewAttachment
                  attachment={{
                    contentType: '',
                    name: filename,
                    url: ''
                  }}
                  isUploading
                  key={filename}
                />
              ))}
            </div>
          )}
          <PromptInputTextarea
            autoFocus
            className='mt-0.5 px-4'
            onChange={e => setInput(e.target.value)}
            placeholder='Send a message...'
            ref={textareaRef}
            rows={1}
            value={input}
          />
          <InputGroupAddon align='block-end' className='gap-0 p-1 pt-0'>
            <AttachmentsButton fileInputRef={fileInputRef} selectedModelId={selectedModelId} status={status} />
            <ModelSelectorCompact onModelChange={onModelChange} selectedModelId={selectedModelId} />
            <Context
              maxTokens={65_536}
              modelId={usage?.modelId}
              usage={usage}
              usedTokens={(usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0)}>
              <ContextTrigger />
              <ContextContent>
                <ContextContentHeader />
                <ContextContentBody>
                  <ContextInputUsage />
                  <ContextOutputUsage />
                  <ContextReasoningUsage />
                  <ContextCacheUsage />
                </ContextContentBody>
                <ContextContentFooter />
              </ContextContent>
            </Context>
            <p className='grow' />
            {status === 'submitted' ? (
              <StopButton setMessages={setMessages} stop={stop} />
            ) : (
              <PromptInputSubmit
                className='rounded-xl'
                disabled={!input.trim() || uploadQueue.length > 0}
                status={status}
              />
            )}
          </InputGroupAddon>
        </PromptInput>
      </>
    )
  }
export default memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false
  if (prevProps.status !== nextProps.status) return false
  if (!equal(prevProps.attachments, nextProps.attachments)) return false
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false
  return true
})
