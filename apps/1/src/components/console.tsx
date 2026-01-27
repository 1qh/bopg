import type { Dispatch, SetStateAction } from 'react'

import { cn } from '@a/ui'
import { TerminalSquare, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useArtifactSelector } from '~/hooks/use-artifact'

interface ConsoleProps {
  consoleOutputs: ConsoleOutput[]
  setConsoleOutputs: Dispatch<SetStateAction<ConsoleOutput[]>>
}

export const Console = ({ consoleOutputs, setConsoleOutputs }: ConsoleProps) => {
  const [height, setHeight] = useState<number>(300),
    [isResizing, setIsResizing] = useState(false),
    consoleEndRef = useRef<HTMLDivElement>(null),
    isArtifactVisible = useArtifactSelector(state => state.isVisible),
    minHeight = 100,
    maxHeight = 800,
    startResizing = useCallback(() => setIsResizing(true), []),
    stopResizing = useCallback(() => setIsResizing(false), []),
    resize = useCallback(
      (e: MouseEvent) => {
        if (isResizing) {
          const newHeight = globalThis.innerHeight - e.clientY
          if (newHeight >= minHeight && newHeight <= maxHeight) setHeight(newHeight)
        }
      },
      [isResizing]
    )
  useEffect(() => {
    globalThis.addEventListener('mousemove', resize)
    globalThis.addEventListener('mouseup', stopResizing)
    return () => {
      globalThis.removeEventListener('mousemove', resize)
      globalThis.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!isArtifactVisible) setConsoleOutputs([])
  }, [isArtifactVisible, setConsoleOutputs])

  return consoleOutputs.length > 0 ? (
    <>
      <div
        aria-orientation='horizontal'
        aria-valuemax={maxHeight}
        aria-valuemin={minHeight}
        aria-valuenow={height}
        className='fixed h-2 w-full cursor-ns-resize'
        onKeyDown={e => {
          if (e.key === 'ArrowUp') setHeight(prev => Math.min(prev + 10, maxHeight))
          else if (e.key === 'ArrowDown') setHeight(prev => Math.max(prev - 10, minHeight))
        }}
        onMouseDown={startResizing}
        role='slider'
        style={{ bottom: height - 4 }}
        tabIndex={0}
      />
      <div
        className={cn('fixed bottom-0 flex w-full flex-col overflow-x-hidden overflow-y-scroll border-t bg-background', {
          'select-none': isResizing
        })}
        style={{ height }}>
        <p className='sticky top-0 flex w-full items-center gap-1 bg-background px-1.5 py-2'>
          <TerminalSquare className='stroke-1' />
          Output
          <X
            className='ml-auto cursor-pointer p-1 transition-all hover:scale-110 hover:text-destructive'
            onClick={() => setConsoleOutputs([])}
          />
        </p>
        <div>
          {consoleOutputs.map((o, index) => (
            <div className='flex px-4 py-2 font-mono text-sm' key={o.id}>
              <p
                className={cn('w-10 shrink-0', {
                  'text-emerald-500': o.status === 'completed',
                  'text-muted-foreground': ['in_progress', 'loading_packages'].includes(o.status),
                  'text-red-400': o.status === 'failed'
                })}>
                [{index + 1}]
              </p>
              {['in_progress', 'loading_packages'].includes(o.status) ? (
                o.status === 'in_progress' ? (
                  'Initializing...'
                ) : o.status === 'loading_packages' ? (
                  o.contents.map(c => (c.type === 'text' ? c.value : null))
                ) : null
              ) : (
                <div className='flex w-full flex-col gap-2 overflow-x-scroll'>
                  {o.contents.map((c, cI) =>
                    c.type === 'image' ? (
                      <picture key={`${o.id}-${cI}`}>
                        {/** biome-ignore lint/correctness/useImageSize: x */}
                        <img alt='output' className='w-full max-w-(--breakpoint-toast-mobile)' src={c.value} />
                      </picture>
                    ) : (
                      <p className='w-full wrap-break-word whitespace-pre-line' key={`${o.id}-${cI}`}>
                        {c.value}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </>
  ) : null
}

export interface ConsoleOutput {
  contents: ConsoleOutputContent[]
  id: string
  status: 'completed' | 'failed' | 'in_progress' | 'loading_packages'
}

export interface ConsoleOutputContent {
  type: 'image' | 'text'
  value: string
}
