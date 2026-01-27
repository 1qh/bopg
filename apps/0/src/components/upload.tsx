/* eslint-disable react-hooks/immutability, complexity, max-statements */
/** biome-ignore-all lint/nursery/noContinue: x */

'use client'

import type {
  ChangeEvent,
  ClipboardEvent,
  ComponentPropsWithoutRef as Com,
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject
} from 'react'

import { cn } from '@a/ui'
import { Slot } from '@radix-ui/react-slot'
import {
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon
} from 'lucide-react'
import Image from 'next/image'
import { createContext, use, useCallback, useEffect, useId, useMemo, useRef, useSyncExternalStore } from 'react'

type Direction = 'ltr' | 'rtl'
interface FileState {
  error?: string
  file: File
  progress: number
  status: 'error' | 'idle' | 'success' | 'uploading'
}
type FileUploadClearProps = Com<'button'> & {
  asChild?: boolean
  forceMount?: boolean
}
interface FileUploadContextValue {
  dir: Direction
  disabled: boolean
  dropzoneId: string
  inputId: string
  inputRef: RefObject<HTMLInputElement | null>
  labelId: string
  listId: string
  urlCache: WeakMap<File, string>
}
type FileUploadDropzoneProps = Com<'div'> & {
  asChild?: boolean
}
interface FileUploadItemContextValue {
  fileState?: FileState
  id: string
  messageId: string
  nameId: string
  sizeId: string
  statusId: string
}
type FileUploadItemDeleteProps = Com<'button'> & {
  asChild?: boolean
}
type FileUploadItemMetadataProps = Com<'div'> & {
  asChild?: boolean
  size?: 'default' | 'sm'
}
type FileUploadItemPreviewProps = Com<'div'> & {
  asChild?: boolean
  render?: (file: File) => ReactNode
}
type FileUploadItemProgressProps = Com<'div'> & {
  asChild?: boolean
  forceMount?: boolean
  size?: number
  variant?: 'circular' | 'fill' | 'linear'
}
type FileUploadItemProps = Com<'div'> & {
  asChild?: boolean
  value: File
}
type FileUploadListProps = Com<'div'> & {
  asChild?: boolean
  forceMount?: boolean
  orientation?: 'horizontal' | 'vertical'
}
type FileUploadRootProps = Omit<Com<'div'>, 'defaultValue' | 'onChange'> & {
  accept?: string
  asChild?: boolean
  defaultValue?: File[]
  dir?: Direction
  disabled?: boolean
  invalid?: boolean
  label?: string
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  name?: string
  onAccept?: (files: File[]) => void
  onFileAccept?: (file: File) => void
  onFileReject?: (file: File, message: string) => void
  onFileValidate?: (file: File) => null | string | undefined
  onUpload?: (
    files: File[],
    options: {
      onError: (file: File, error: Error) => void
      onProgress: (file: File, progress: number) => void
      onSuccess: (file: File) => void
    }
  ) => Promise<void> | void
  onValueChange?: (files: File[]) => void
  required?: boolean
  value?: File[]
}
type FileUploadTriggerProps = Com<'button'> & {
  asChild?: boolean
}
type StoreAction =
  | { dragOver: boolean; type: 'SET_DRAG_OVER' }
  | { error: string; file: File; type: 'SET_ERROR' }
  | { file: File; progress: number; type: 'SET_PROGRESS' }
  | { file: File; type: 'REMOVE_FILE' }
  | { file: File; type: 'SET_SUCCESS' }
  | { files: File[]; type: 'ADD_FILES' }
  | { files: File[]; type: 'SET_FILES' }
  | { invalid: boolean; type: 'SET_INVALID' }
  | { type: 'CLEAR' }
interface StoreState {
  dragOver: boolean
  files: Map<File, FileState>
  invalid: boolean
}
const ROOT_NAME = 'FileUpload',
  DROPZONE_NAME = 'FileUploadDropzone',
  TRIGGER_NAME = 'FileUploadTrigger',
  LIST_NAME = 'FileUploadList',
  ITEM_NAME = 'FileUploadItem',
  ITEM_PREVIEW_NAME = 'FileUploadItemPreview',
  ITEM_METADATA_NAME = 'FileUploadItemMetadata',
  ITEM_PROGRESS_NAME = 'FileUploadItemProgress',
  ITEM_DELETE_NAME = 'FileUploadItemDelete',
  CLEAR_NAME = 'FileUploadClear',
  useLazyRef = <T,>(fn: () => T) => {
    const ref = useRef<null | T>(null)
    ref.current ??= fn()
    return ref as RefObject<T>
  },
  DirectionContext = createContext<Direction | undefined>(undefined),
  useDirection = (dirProp?: Direction): Direction => {
    const contextDir = use(DirectionContext)
    return dirProp ?? contextDir ?? 'ltr'
  },
  // biome-ignore lint/nursery/useMaxParams: x
  createStore = (
    listeners: Set<() => void>,
    files: Map<File, FileState>,
    urlCache: WeakMap<File, string>,
    invalid: boolean,
    onValueChange?: (a: File[]) => void
    // eslint-disable-next-line @typescript-eslint/max-params
  ) => {
    let state: StoreState = {
      dragOver: false,
      files,
      invalid
    }
    const reducer = (s: StoreState, action: StoreAction): StoreState => {
        switch (action.type) {
          case 'ADD_FILES':
            for (const file of action.files)
              files.set(file, {
                file,
                progress: 0,
                status: 'idle'
              })
            if (onValueChange) {
              const fileList = [...files.values()].map(fileState => fileState.file)
              onValueChange(fileList)
            }
            return { ...s, files }
          case 'CLEAR':
            for (const file of files.keys()) {
              const cachedUrl = urlCache.get(file)
              if (cachedUrl) {
                URL.revokeObjectURL(cachedUrl)
                urlCache.delete(file)
              }
            }
            files.clear()
            if (onValueChange) onValueChange([])
            return { ...s, files, invalid: false }
          case 'REMOVE_FILE': {
            const cachedUrl = urlCache.get(action.file)
            if (cachedUrl) {
              URL.revokeObjectURL(cachedUrl)
              urlCache.delete(action.file)
            }
            files.delete(action.file)
            if (onValueChange) {
              const fileList = [...files.values()].map(fileState => fileState.file)
              onValueChange(fileList)
            }
            return { ...s, files }
          }
          case 'SET_DRAG_OVER':
            return { ...s, dragOver: action.dragOver }
          case 'SET_ERROR': {
            const fileState = files.get(action.file)
            if (fileState)
              files.set(action.file, {
                ...fileState,
                error: action.error,
                status: 'error'
              })
            return { ...s, files }
          }
          case 'SET_FILES': {
            const newFileSet = new Set(action.files)
            for (const existingFile of files.keys()) if (!newFileSet.has(existingFile)) files.delete(existingFile)
            for (const file of action.files) {
              const existingState = files.get(file)
              if (!existingState)
                files.set(file, {
                  file,
                  progress: 0,
                  status: 'idle'
                })
            }
            return { ...s, files }
          }
          case 'SET_INVALID':
            return { ...s, invalid: action.invalid }
          case 'SET_PROGRESS': {
            const fileState = files.get(action.file)
            if (fileState)
              files.set(action.file, {
                ...fileState,
                progress: action.progress,
                status: 'uploading'
              })
            return { ...s, files }
          }
          case 'SET_SUCCESS': {
            const fileState = files.get(action.file)
            if (fileState)
              files.set(action.file, {
                ...fileState,
                progress: 100,
                status: 'success'
              })
            return { ...s, files }
          }
          default:
            return s
        }
      },
      getState = () => state,
      dispatch = (action: StoreAction) => {
        state = reducer(state, action)
        for (const listener of listeners) listener()
      },
      subscribe = (listener: () => void) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      }
    return { dispatch, getState, subscribe }
  },
  StoreContext = createContext<null | ReturnType<typeof createStore>>(null),
  useStoreContext = (consumerName: string) => {
    const context = use(StoreContext)
    if (!context) throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``)
    return context
  },
  useStore = <T,>(selector: (state: StoreState) => T): T => {
    const store = useStoreContext(ROOT_NAME),
      lastValueRef = useLazyRef<null | { state: StoreState; value: T }>(() => null),
      getSnapshot = useCallback(() => {
        const state = store.getState(),
          prevValue = lastValueRef.current
        if (prevValue?.state === state) return prevValue.value
        const nextValue = selector(state)
        lastValueRef.current = { state, value: nextValue }
        return nextValue
      }, [store, selector, lastValueRef])
    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
  },
  FileUploadContext = createContext<FileUploadContextValue | null>(null),
  useFileUploadContext = (consumerName: string) => {
    const context = use(FileUploadContext)
    if (!context) throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``)
    return context
  },
  FileUploadRoot = (props: FileUploadRootProps) => {
    const {
        accept,
        asChild,
        children,
        className,
        defaultValue,
        dir: dirProp,
        disabled = false,
        invalid = false,
        label,
        maxFiles,
        maxSize,
        multiple = false,
        name,
        onAccept,
        onFileAccept,
        onFileReject,
        onFileValidate,
        onUpload,
        onValueChange,
        required = false,
        value,
        ...rootProps
      } = props,
      inputId = useId(),
      dropzoneId = useId(),
      listId = useId(),
      labelId = useId(),
      dir = useDirection(dirProp),
      listeners = useLazyRef(() => new Set<() => void>()).current,
      files = useLazyRef<Map<File, FileState>>(() => new Map()).current,
      urlCache = useLazyRef(() => new WeakMap<File, string>()).current,
      inputRef = useRef<HTMLInputElement>(null),
      isControlled = value !== undefined,
      store = useMemo(
        () => createStore(listeners, files, urlCache, invalid, onValueChange),
        [listeners, files, invalid, onValueChange, urlCache]
      ),
      acceptTypes = useMemo(() => accept?.split(',').map(t => t.trim()) ?? null, [accept]),
      onProgress = useLazyRef(() => {
        let frame = 0
        return (file: File, progress: number) => {
          if (frame) return
          frame = requestAnimationFrame(() => {
            frame = 0
            store.dispatch({
              file,
              progress: Math.min(Math.max(0, progress), 100),
              type: 'SET_PROGRESS'
            })
          })
        }
      }).current
    useEffect(() => {
      if (isControlled) store.dispatch({ files: value, type: 'SET_FILES' })
      else if (defaultValue && defaultValue.length > 0 && !store.getState().files.size)
        store.dispatch({ files: defaultValue, type: 'SET_FILES' })
    }, [value, defaultValue, isControlled, store])
    useEffect(
      () => () => {
        for (const file of files.keys()) {
          const cachedUrl = urlCache.get(file)
          if (cachedUrl) URL.revokeObjectURL(cachedUrl)
        }
      },
      [files, urlCache]
    )
    const onFilesUpload = useCallback(
        async (fs: File[]) => {
          try {
            for (const f of fs) store.dispatch({ file: f, progress: 0, type: 'SET_PROGRESS' })
            if (onUpload)
              await onUpload(fs, {
                onError: (file, error) => {
                  store.dispatch({
                    error: error.message.length > 0 ? error.message : 'Upload failed',
                    file,
                    type: 'SET_ERROR'
                  })
                },
                onProgress,
                onSuccess: file => {
                  store.dispatch({ file, type: 'SET_SUCCESS' })
                }
              })
            else for (const file of fs) store.dispatch({ file, type: 'SET_SUCCESS' })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            for (const file of fs)
              store.dispatch({
                error: errorMessage,
                file,
                type: 'SET_ERROR'
              })
          }
        },
        [store, onUpload, onProgress]
      ),
      onFilesChange = useCallback(
        (originalFiles: File[]) => {
          if (disabled) return
          let filesToProcess = [...originalFiles],
            invalidC = false
          if (maxFiles) {
            const currentCount = store.getState().files.size,
              remainingSlotCount = Math.max(0, maxFiles - currentCount)
            if (remainingSlotCount < filesToProcess.length) {
              const rejectedFiles = filesToProcess.slice(remainingSlotCount)
              invalidC = true
              filesToProcess = filesToProcess.slice(0, remainingSlotCount)
              for (const file of rejectedFiles) {
                let rejectionMessage = `Maximum ${maxFiles} files allowed`
                if (onFileValidate) {
                  const validationMessage = onFileValidate(file)
                  // eslint-disable-next-line max-depth
                  if (validationMessage) rejectionMessage = validationMessage
                }
                onFileReject?.(file, rejectionMessage)
              }
            }
          }
          const acceptedFiles: File[] = [],
            rejectedFiles: { file: File; message: string }[] = []
          for (const file of filesToProcess) {
            let rejected = false,
              rejectionMessage = ''
            if (onFileValidate) {
              const validationMessage = onFileValidate(file)
              if (validationMessage) {
                rejectionMessage = validationMessage
                onFileReject?.(file, rejectionMessage)
                invalidC = true
                // eslint-disable-next-line no-continue
                continue
              }
            }
            if (acceptTypes) {
              const fileType = file.type,
                fileExtension = `.${file.name.split('.').pop()}`
              if (
                !acceptTypes.some(
                  type =>
                    type === fileType ||
                    type === fileExtension ||
                    (type.includes('/*') && fileType.startsWith(type.replace('/*', '/')))
                )
              ) {
                rejectionMessage = 'File type not accepted'
                onFileReject?.(file, rejectionMessage)
                rejected = true
                invalidC = true
              }
            }
            if (maxSize && file.size > maxSize) {
              rejectionMessage = 'File too large'
              onFileReject?.(file, rejectionMessage)
              rejected = true
              invalidC = true
            }
            if (rejected) rejectedFiles.push({ file, message: rejectionMessage })
            else acceptedFiles.push(file)
          }
          if (invalidC) {
            store.dispatch({ invalid: invalidC, type: 'SET_INVALID' })
            setTimeout(() => {
              store.dispatch({ invalid: false, type: 'SET_INVALID' })
            }, 2000)
          }
          if (acceptedFiles.length > 0) {
            store.dispatch({ files: acceptedFiles, type: 'ADD_FILES' })
            if (isControlled && onValueChange) {
              const currentFiles = [...store.getState().files.values()].map(f => f.file)
              onValueChange([...currentFiles])
            }
            if (onAccept) onAccept(acceptedFiles)
            for (const file of acceptedFiles) onFileAccept?.(file)
            if (onUpload)
              requestAnimationFrame(() => {
                onFilesUpload(acceptedFiles)
              })
          }
        },
        [
          store,
          isControlled,
          onValueChange,
          onAccept,
          onFileAccept,
          onUpload,
          maxFiles,
          onFileValidate,
          onFilesUpload,
          onFileReject,
          acceptTypes,
          maxSize,
          disabled
        ]
      ),
      onInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
          onFilesChange([...(event.target.files ?? [])])
          event.target.value = ''
        },
        [onFilesChange]
      ),
      contextValue = useMemo<FileUploadContextValue>(
        () => ({
          dir,
          disabled,
          dropzoneId,
          inputId,
          inputRef,
          labelId,
          listId,
          urlCache
        }),
        [dropzoneId, inputId, listId, labelId, dir, disabled, urlCache]
      ),
      RootPrimitive = asChild ? Slot : 'div'
    return (
      <StoreContext value={store}>
        <FileUploadContext value={contextValue}>
          <RootPrimitive
            data-disabled={disabled ? '' : undefined}
            data-slot='file-upload'
            dir={dir}
            {...rootProps}
            className={cn('relative flex flex-col gap-2', className)}>
            {children}
            <input
              accept={accept}
              aria-describedby={dropzoneId}
              aria-labelledby={labelId}
              className='sr-only'
              disabled={disabled}
              id={inputId}
              multiple={multiple}
              name={name}
              onChange={onInputChange}
              ref={inputRef}
              required={required}
              tabIndex={-1}
              type='file'
            />
            <span className='sr-only' id={labelId}>
              {label ?? 'File upload'}
            </span>
          </RootPrimitive>
        </FileUploadContext>
      </StoreContext>
    )
  },
  FileUploadDropzone = (props: FileUploadDropzoneProps) => {
    const {
        asChild,
        className,
        onClick: onClickProp,
        onDragEnter: onDragEnterProp,
        onDragLeave: onDragLeaveProp,
        onDragOver: onDragOverProp,
        onDrop: onDropProp,
        onKeyDown: onKeyDownProp,
        onPaste: onPasteProp,
        ...dropzoneProps
      } = props,
      context = useFileUploadContext(DROPZONE_NAME),
      store = useStoreContext(DROPZONE_NAME),
      dragOver = useStore(state => state.dragOver),
      invalid = useStore(state => state.invalid),
      onClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
          onClickProp?.(event)
          if (event.defaultPrevented) return
          const { target } = event,
            isFromTrigger = target instanceof HTMLElement && target.closest('[data-slot="file-upload-trigger"]')
          if (!isFromTrigger) context.inputRef.current?.click()
        },
        [context.inputRef, onClickProp]
      ),
      onDragOver = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
          onDragOverProp?.(event)
          if (event.defaultPrevented) return
          event.preventDefault()
          store.dispatch({ dragOver: true, type: 'SET_DRAG_OVER' })
        },
        [store, onDragOverProp]
      ),
      onDragEnter = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
          onDragEnterProp?.(event)
          if (event.defaultPrevented) return
          event.preventDefault()
          store.dispatch({ dragOver: true, type: 'SET_DRAG_OVER' })
        },
        [store, onDragEnterProp]
      ),
      onDragLeave = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
          onDragLeaveProp?.(event)
          if (event.defaultPrevented) return
          const { relatedTarget } = event
          if (relatedTarget && relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) return
          event.preventDefault()
          store.dispatch({ dragOver: false, type: 'SET_DRAG_OVER' })
        },
        [store, onDragLeaveProp]
      ),
      onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
          onDropProp?.(event)
          if (event.defaultPrevented) return
          event.preventDefault()
          store.dispatch({ dragOver: false, type: 'SET_DRAG_OVER' })
          const files = [...event.dataTransfer.files],
            inputElement = context.inputRef.current
          if (!inputElement) return
          const dataTransfer = new DataTransfer()
          for (const file of files) dataTransfer.items.add(file)
          inputElement.files = dataTransfer.files
          inputElement.dispatchEvent(new Event('change', { bubbles: true }))
        },
        [store, context.inputRef, onDropProp]
      ),
      onPaste = useCallback(
        (event: ClipboardEvent<HTMLDivElement>) => {
          onPasteProp?.(event)
          if (event.defaultPrevented) return
          event.preventDefault()
          store.dispatch({ dragOver: false, type: 'SET_DRAG_OVER' })
          const { items } = event.clipboardData
          if (!items.length) return
          const files: File[] = []
          for (const item of items)
            if (item.kind === 'file') {
              const file = item.getAsFile()
              if (file) files.push(file)
            }
          if (files.length === 0) return
          const inputElement = context.inputRef.current
          if (!inputElement) return
          const dataTransfer = new DataTransfer()
          for (const file of files) dataTransfer.items.add(file)
          inputElement.files = dataTransfer.files
          inputElement.dispatchEvent(new Event('change', { bubbles: true }))
        },
        [store, context.inputRef, onPasteProp]
      ),
      onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
          onKeyDownProp?.(event)
          if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            context.inputRef.current?.click()
          }
        },
        [context.inputRef, onKeyDownProp]
      ),
      DropzonePrimitive = asChild ? Slot : 'div'
    return (
      <DropzonePrimitive
        aria-controls={`${context.inputId} ${context.listId}`}
        data-disabled={context.disabled ? '' : undefined}
        data-dragging={dragOver ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
        data-slot='file-upload-dropzone'
        dir={context.dir}
        id={context.dropzoneId}
        role='region'
        tabIndex={context.disabled ? undefined : 0}
        {...dropzoneProps}
        className={cn(
          'relative flex flex-col items-center rounded-lg border-2 border-dashed transition-colors outline-none select-none hover:bg-accent/30 focus-visible:border-ring/50 data-disabled:pointer-events-none data-dragging:border-primary/30 data-dragging:bg-accent/30 data-invalid:border-destructive data-invalid:ring-destructive/20',
          className
        )}
        onClick={onClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
    )
  },
  FileUploadTrigger = (props: FileUploadTriggerProps) => {
    const { asChild, onClick: onClickProp, ...triggerProps } = props,
      context = useFileUploadContext(TRIGGER_NAME),
      onClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          onClickProp?.(event)
          if (event.defaultPrevented) return
          context.inputRef.current?.click()
        },
        [context.inputRef, onClickProp]
      ),
      TriggerPrimitive = asChild ? Slot : 'button'
    return (
      <TriggerPrimitive
        aria-controls={context.inputId}
        data-disabled={context.disabled ? '' : undefined}
        data-slot='file-upload-trigger'
        type='button'
        {...triggerProps}
        disabled={context.disabled}
        onClick={onClick}
      />
    )
  },
  FileUploadList = (props: FileUploadListProps) => {
    const { asChild, className, forceMount, orientation = 'vertical', ...listProps } = props,
      context = useFileUploadContext(LIST_NAME),
      fileCount = useStore(state => state.files.size),
      shouldRender = forceMount ?? fileCount > 0
    if (!shouldRender) return null
    const ListPrimitive = asChild ? Slot : 'div'
    return (
      <ListPrimitive
        data-orientation={orientation}
        data-slot='file-upload-list'
        dir={context.dir}
        id={context.listId}
        role='list'
        {...listProps}
        className={cn(
          'flex flex-col gap-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-top-2 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-top-2',
          orientation === 'horizontal' && 'flex-row overflow-x-auto p-1.5',
          className
        )}
      />
    )
  },
  FileUploadItemContext = createContext<FileUploadItemContextValue | null>(null),
  useFileUploadItemContext = (consumerName: string) => {
    const context = use(FileUploadItemContext)
    if (!context) throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``)
    return context
  },
  FileUploadItem = (props: FileUploadItemProps) => {
    const { asChild, children, className, value, ...itemProps } = props,
      id = useId(),
      statusId = `${id}-status`,
      nameId = `${id}-name`,
      sizeId = `${id}-size`,
      messageId = `${id}-message`,
      context = useFileUploadContext(ITEM_NAME),
      fileState = useStore(state => state.files.get(value)),
      fileCount = useStore(state => state.files.size),
      fileIndex = useStore(state => {
        const files = [...state.files.keys()]
        return files.indexOf(value) + 1
      }),
      itemContext = useMemo(
        () => ({
          fileState,
          id,
          messageId,
          nameId,
          sizeId,
          statusId
        }),
        [id, fileState, statusId, nameId, sizeId, messageId]
      )
    if (!fileState) return null
    const statusText = fileState.error
        ? `Error: ${fileState.error}`
        : fileState.status === 'uploading'
          ? `Uploading: ${fileState.progress}% complete`
          : fileState.status === 'success'
            ? 'Upload complete'
            : 'Ready to upload',
      ItemPrimitive = asChild ? Slot : 'div'
    return (
      <FileUploadItemContext value={itemContext}>
        <ItemPrimitive
          aria-describedby={`${nameId} ${sizeId} ${statusId} ${fileState.error ? messageId : ''}`}
          aria-labelledby={nameId}
          aria-posinset={fileIndex}
          aria-setsize={fileCount}
          data-slot='file-upload-item'
          dir={context.dir}
          id={id}
          role='listitem'
          {...itemProps}
          className={cn('flex items-center', className)}>
          {children}
          <span className='sr-only' id={statusId}>
            {statusText}
          </span>
        </ItemPrimitive>
      </FileUploadItemContext>
    )
  },
  formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`
  },
  getFileIcon = (file: File) => {
    const { type } = file,
      extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (type.startsWith('video/')) return <FileVideoIcon />
    if (type.startsWith('audio/')) return <FileAudioIcon />
    if (type.startsWith('text/') || ['md', 'pdf', 'rtf', 'txt'].includes(extension)) return <FileTextIcon />
    if (
      ['c', 'cpp', 'cs', 'css', 'html', 'java', 'js', 'json', 'jsx', 'php', 'py', 'rb', 'ts', 'tsx', 'xml'].includes(
        extension
      )
    )
      return <FileCodeIcon />
    if (['7z', 'bz2', 'gz', 'rar', 'tar', 'zip'].includes(extension)) return <FileArchiveIcon />
    if (['apk', 'app', 'deb', 'exe', 'msi', 'rpm'].includes(extension) || type.startsWith('application/'))
      return <FileCogIcon />
    return <FileIcon />
  },
  FileUploadItemPreview = (props: FileUploadItemPreviewProps) => {
    const { asChild, children, className, render, ...previewProps } = props,
      itemContext = useFileUploadItemContext(ITEM_PREVIEW_NAME),
      context = useFileUploadContext(ITEM_PREVIEW_NAME),
      onPreviewRender = useCallback(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        (f: File) => {
          if (render) return render(f)
          if (itemContext.fileState?.file.type.startsWith('image/')) {
            let url = context.urlCache.get(f)
            if (!url) {
              url = URL.createObjectURL(f)
              context.urlCache.set(f, url)
            }
            return <Image alt={f.name} className='size-full object-cover' fill src={url} />
          }
          return getFileIcon(f)
        },
        [render, itemContext.fileState?.file.type, context.urlCache]
      )
    if (!itemContext.fileState) return null
    const ItemPreviewPrimitive = asChild ? Slot : 'div'
    return (
      <ItemPreviewPrimitive
        aria-labelledby={itemContext.nameId}
        data-slot='file-upload-preview'
        {...previewProps}
        className={cn(
          'relative size-10 overflow-hidden rounded-sm [&>svg]:size-10 [&>svg]:stroke-1 [&>svg]:p-1',
          className
        )}>
        {onPreviewRender(itemContext.fileState.file)}
        {children}
      </ItemPreviewPrimitive>
    )
  },
  FileUploadItemMetadata = (props: FileUploadItemMetadataProps) => {
    const { asChild, children, className, size = 'default', ...metadataProps } = props,
      context = useFileUploadContext(ITEM_METADATA_NAME),
      itemContext = useFileUploadItemContext(ITEM_METADATA_NAME)
    if (!itemContext.fileState) return null
    const ItemMetadataPrimitive = asChild ? Slot : 'div'
    return (
      <ItemMetadataPrimitive
        data-slot='file-upload-metadata'
        dir={context.dir}
        {...metadataProps}
        className={cn('flex min-w-0 flex-1 flex-col', className)}>
        {children ?? (
          <>
            <span
              className={cn('truncate text-sm font-medium', size === 'sm' && 'text-[13px] leading-snug font-normal')}
              id={itemContext.nameId}>
              {itemContext.fileState.file.name}
            </span>
            <span
              className={cn('truncate text-xs text-muted-foreground', size === 'sm' && 'text-[11px] leading-snug')}
              id={itemContext.sizeId}>
              {formatBytes(itemContext.fileState.file.size)}
            </span>
            {itemContext.fileState.error ? (
              <span className='text-xs text-destructive' id={itemContext.messageId}>
                {itemContext.fileState.error}
              </span>
            ) : null}
          </>
        )}
      </ItemMetadataPrimitive>
    )
  },
  FileUploadItemProgress = (props: FileUploadItemProgressProps) => {
    const { asChild, className, forceMount, size = 40, variant = 'linear', ...progressProps } = props,
      itemContext = useFileUploadItemContext(ITEM_PROGRESS_NAME)
    if (!itemContext.fileState) return null
    const shouldRender = forceMount ?? itemContext.fileState.progress !== 100
    if (!shouldRender) return null
    const ItemProgressPrimitive = asChild ? Slot : 'div'
    switch (variant) {
      case 'circular': {
        const circumference = 2 * Math.PI * ((size - 4) / 2),
          strokeDashoffset = circumference - (itemContext.fileState.progress / 100) * circumference
        return (
          <ItemProgressPrimitive
            aria-labelledby={itemContext.nameId}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={itemContext.fileState.progress}
            aria-valuetext={`${itemContext.fileState.progress}%`}
            data-slot='file-upload-progress'
            role='progressbar'
            {...progressProps}
            className={cn('absolute top-1/2 left-1/2 -translate-1/2', className)}>
            <svg
              className='-rotate-90 transform'
              fill='none'
              height={size}
              stroke='currentColor'
              viewBox={`0 0 ${size} ${size}`}
              width={size}>
              <circle className='text-primary/20' cx={size / 2} cy={size / 2} r={(size - 4) / 2} strokeWidth='2' />
              <circle
                className='text-primary transition-[stroke-dashoffset] duration-300 ease-linear'
                cx={size / 2}
                cy={size / 2}
                r={(size - 4) / 2}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap='round'
                strokeWidth='2'
              />
            </svg>
          </ItemProgressPrimitive>
        )
      }
      case 'fill': {
        const progressPercentage = itemContext.fileState.progress,
          topInset = 100 - progressPercentage
        return (
          <ItemProgressPrimitive
            aria-labelledby={itemContext.nameId}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercentage}
            aria-valuetext={`${progressPercentage}%`}
            data-slot='file-upload-progress'
            role='progressbar'
            {...progressProps}
            className={cn('absolute inset-0 bg-primary/50 transition-[clip-path] duration-300 ease-linear', className)}
            style={{
              clipPath: `inset(${topInset}% 0% 0% 0%)`
            }}
          />
        )
      }
      case 'linear':
        return
      default:
        return (
          <ItemProgressPrimitive
            aria-labelledby={itemContext.nameId}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={itemContext.fileState.progress}
            aria-valuetext={`${itemContext.fileState.progress}%`}
            data-slot='file-upload-progress'
            role='progressbar'
            {...progressProps}
            className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20', className)}>
            <div
              className='size-full flex-1 bg-primary transition-transform duration-300 ease-linear'
              style={{
                transform: `translateX(-${100 - itemContext.fileState.progress}%)`
              }}
            />
          </ItemProgressPrimitive>
        )
    }
  },
  FileUploadItemDelete = (props: FileUploadItemDeleteProps) => {
    const { asChild, onClick: onClickProp, ...deleteProps } = props,
      store = useStoreContext(ITEM_DELETE_NAME),
      itemContext = useFileUploadItemContext(ITEM_DELETE_NAME),
      onClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          onClickProp?.(event)
          if (!itemContext.fileState || event.defaultPrevented) return
          store.dispatch({
            file: itemContext.fileState.file,
            type: 'REMOVE_FILE'
          })
        },
        [store, itemContext.fileState, onClickProp]
      )
    if (!itemContext.fileState) return null
    const ItemDeletePrimitive = asChild ? Slot : 'button'
    return (
      <ItemDeletePrimitive
        aria-controls={itemContext.id}
        aria-describedby={itemContext.nameId}
        data-slot='file-upload-item-delete'
        type='button'
        {...deleteProps}
        onClick={onClick}
      />
    )
  },
  FileUploadClear = (props: FileUploadClearProps) => {
    const { asChild, disabled, forceMount, onClick: onClickProp, ...clearProps } = props,
      context = useFileUploadContext(CLEAR_NAME),
      store = useStoreContext(CLEAR_NAME),
      fileCount = useStore(state => state.files.size),
      isDisabled = disabled ?? context.disabled,
      onClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          onClickProp?.(event)
          if (event.defaultPrevented) return
          store.dispatch({ type: 'CLEAR' })
        },
        [store, onClickProp]
      ),
      shouldRender = forceMount ?? fileCount > 0
    if (!shouldRender) return null
    const ClearPrimitive = asChild ? Slot : 'button'
    return (
      <ClearPrimitive
        aria-controls={context.listId}
        data-disabled={isDisabled ? '' : undefined}
        data-slot='file-upload-clear'
        type='button'
        {...clearProps}
        disabled={isDisabled}
        onClick={onClick}
      />
    )
  }
export {
  FileUploadRoot as FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadRootProps as FileUploadProps,
  FileUploadTrigger,
  useStore as useFileUpload
}
