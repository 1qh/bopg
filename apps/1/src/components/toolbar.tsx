'use client'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react'

import { cn } from '@a/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@a/ui/tooltip'
import { ArrowUp, Lightbulb } from 'lucide-react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { memo, useEffect, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import type { ChatMessage } from '~/types'

import type { ArtifactKind } from './artifact'
import type { ArtifactToolbarItem } from './create-artifact'

import { artifactDefinitions } from './artifact'

interface ToolProps {
  description: string
  icon: ReactNode
  isAnimating: boolean
  isToolbarVisible?: boolean
  onClick: ({ sendMessage }: { sendMessage: UseChatHelpers<ChatMessage>['sendMessage'] }) => void
  selectedTool: null | string
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
  setIsToolbarVisible?: Dispatch<SetStateAction<boolean>>
  setSelectedTool: Dispatch<SetStateAction<null | string>>
}

const Tool = ({
    description,
    icon,
    isAnimating,
    isToolbarVisible,
    onClick,
    selectedTool,
    sendMessage,
    setIsToolbarVisible,
    setSelectedTool
  }: ToolProps) => {
    const [isHovered, setIsHovered] = useState(false)
    useEffect(() => {
      if (selectedTool !== description) setIsHovered(false)
    }, [selectedTool, description])

    const handleSelect = () => {
      if (!isToolbarVisible && setIsToolbarVisible) {
        setIsToolbarVisible(true)
        return
      }
      if (!selectedTool) {
        setIsHovered(true)
        setSelectedTool(description)
        return
      }
      if (selectedTool === description) {
        setSelectedTool(null)
        onClick({ sendMessage })
      } else setSelectedTool(description)
    }
    return (
      <Tooltip open={isHovered ? !isAnimating : false}>
        <TooltipTrigger asChild>
          <motion.div
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
            className={cn('rounded-full p-3', {
              'bg-primary text-primary-foreground!': selectedTool === description
            })}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            initial={{ opacity: 0, scale: 1 }}
            onClick={() => handleSelect()}
            onHoverEnd={() => {
              if (selectedTool !== description) setIsHovered(false)
            }}
            onHoverStart={() => setIsHovered(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSelect()
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}>
            {selectedTool === description ? <ArrowUp /> : icon}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side='left'>{description}</TooltipContent>
      </Tooltip>
    )
  },
  ReadingLevelSelector = ({
    isAnimating,
    sendMessage,
    setSelectedTool
  }: {
    isAnimating: boolean
    sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
    setSelectedTool: Dispatch<SetStateAction<null | string>>
  }) => {
    const LEVELS = ['Elementary', 'Middle School', 'Keep current level', 'High School', 'College', 'Graduate'],
      y = useMotionValue(-40 * 2),
      dragConstraints = 5 * 40 + 2,
      yToLevel = useTransform(y, [0, -dragConstraints], [0, 5]),
      [currentLevel, setCurrentLevel] = useState(2),
      [hasUserSelectedLevel, setHasUserSelectedLevel] = useState<boolean>(false)

    useEffect(() => {
      const unsubscribe = yToLevel.on('change', latest => {
        const level = Math.min(5, Math.max(0, Math.round(Math.abs(latest))))
        setCurrentLevel(level)
      })
      return () => unsubscribe()
    }, [yToLevel])

    return (
      <div className='relative flex flex-col items-center justify-end pb-px'>
        {LEVELS.map(l => (
          <motion.div
            animate={{ opacity: 1 }}
            className='flex size-10 items-center justify-center'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={l}
            transition={{ delay: 0.1 }}>
            <div className='size-2 rounded-full bg-muted-foreground/40' />
          </motion.div>
        ))}
        <TooltipProvider>
          <Tooltip open={!isAnimating}>
            <TooltipTrigger asChild>
              <motion.div
                className={cn('absolute flex items-center rounded-full border bg-background p-2', {
                  'bg-foreground text-background': currentLevel !== 2,
                  'bg-muted text-foreground': currentLevel === 2
                })}
                drag='y'
                dragConstraints={{ bottom: 0, top: -dragConstraints }}
                dragElastic={0}
                dragMomentum={false}
                onClick={() => {
                  if (currentLevel !== 2 && hasUserSelectedLevel) {
                    sendMessage({
                      parts: [{ text: `Please adjust the reading level to ${LEVELS[currentLevel]} level.`, type: 'text' }],
                      role: 'user'
                    })
                    setSelectedTool(null)
                  }
                }}
                onDragEnd={() => {
                  if (currentLevel === 2) setSelectedTool(null)
                  else setHasUserSelectedLevel(true)
                }}
                onDragStart={() => setHasUserSelectedLevel(false)}
                style={{ y }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                {currentLevel === 2 ? <Lightbulb /> : <ArrowUp />}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side='left'>{LEVELS[currentLevel]}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  },
  Tools = ({
    isAnimating,
    isToolbarVisible,
    selectedTool,
    sendMessage,
    setIsToolbarVisible,
    setSelectedTool,
    tools
  }: {
    isAnimating: boolean
    isToolbarVisible: boolean
    selectedTool: null | string
    sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
    setIsToolbarVisible: Dispatch<SetStateAction<boolean>>
    setSelectedTool: Dispatch<SetStateAction<null | string>>
    tools: ArtifactToolbarItem[]
  }) => {
    const [primaryTool, ...secondaryTools] = tools
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className='flex flex-col gap-1.5'
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.95 }}>
        <AnimatePresence>
          {isToolbarVisible
            ? secondaryTools.map(t => (
                <Tool
                  description={t.description}
                  icon={t.icon}
                  isAnimating={isAnimating}
                  key={t.description}
                  onClick={t.onClick}
                  selectedTool={selectedTool}
                  sendMessage={sendMessage}
                  setSelectedTool={setSelectedTool}
                />
              ))
            : null}
        </AnimatePresence>
        <Tool
          description={primaryTool?.description ?? ''}
          icon={primaryTool?.icon}
          isAnimating={isAnimating}
          isToolbarVisible={isToolbarVisible}
          onClick={
            primaryTool?.onClick ??
            (() => {
              //
            })
          }
          selectedTool={selectedTool}
          sendMessage={sendMessage}
          setIsToolbarVisible={setIsToolbarVisible}
          setSelectedTool={setSelectedTool}
        />
      </motion.div>
    )
  },
  PureToolbar = ({
    artifactKind,
    isToolbarVisible,
    sendMessage,
    setIsToolbarVisible,
    setMessages,
    status,
    stop
  }: {
    artifactKind: ArtifactKind
    isToolbarVisible: boolean
    sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
    setIsToolbarVisible: Dispatch<SetStateAction<boolean>>
    setMessages: UseChatHelpers<ChatMessage>['setMessages']
    status: UseChatHelpers<ChatMessage>['status']
    stop: UseChatHelpers<ChatMessage>['stop']
  }) => {
    const toolbarRef = useRef<HTMLDivElement>(null),
      timeoutRef = useRef<ReturnType<typeof setTimeout>>(null),
      [selectedTool, setSelectedTool] = useState<null | string>(null),
      [isAnimating, setIsAnimating] = useState(false)

    useOnClickOutside(toolbarRef as RefObject<HTMLElement>, () => {
      setIsToolbarVisible(false)
      setSelectedTool(null)
    })
    const startCloseTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setSelectedTool(null)
          setIsToolbarVisible(false)
        }, 2000)
      },
      cancelCloseTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    useEffect(
      () => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      },
      []
    )
    useEffect(() => {
      if (status === 'streaming') setIsToolbarVisible(false)
    }, [status, setIsToolbarVisible])

    const artifactDefinition = artifactDefinitions.find(d => d.kind === artifactKind)
    if (!artifactDefinition) throw new Error('Artifact definition not found!')
    const toolsByArtifactKind = artifactDefinition.toolbar
    if (toolsByArtifactKind.length === 0) return null
    return (
      <TooltipProvider delayDuration={0}>
        <motion.div
          animate={
            isToolbarVisible
              ? selectedTool === 'Adjust reading level'
                ? {
                    height: 6 * 43,
                    opacity: 1,
                    scale: 0.95,
                    transition: { delay: 0 },
                    y: 0
                  }
                : {
                    height: toolsByArtifactKind.length * 58,
                    opacity: 1,
                    scale: 1,
                    transition: { delay: 0 },
                    y: 0
                  }
              : { height: 62, opacity: 1, transition: { delay: 0 }, y: 0 }
          }
          className='absolute right-3 bottom-3 flex cursor-pointer flex-col justify-end rounded-full border bg-background p-1.5 shadow-lg'
          exit={{ opacity: 0, transition: { duration: 0.1 }, y: -20 }}
          initial={{ opacity: 0, scale: 1, y: -20 }}
          onAnimationComplete={() => setIsAnimating(false)}
          onAnimationStart={() => setIsAnimating(true)}
          onHoverEnd={() => {
            if (status === 'streaming') return
            startCloseTimer()
          }}
          onHoverStart={() => {
            if (status === 'streaming') return
            cancelCloseTimer()
            setIsToolbarVisible(true)
          }}
          ref={toolbarRef}
          transition={{ damping: 25, stiffness: 300, type: 'spring' }}>
          {status === 'streaming' ? (
            <button
              className='flex size-12'
              onClick={() => {
                stop()
                setMessages(m => m)
              }}
              type='button'>
              <div className='m-auto size-5 bg-foreground' />
            </button>
          ) : selectedTool === 'Adjust reading level' ? (
            <ReadingLevelSelector
              isAnimating={isAnimating}
              key='reading-level-selector'
              sendMessage={sendMessage}
              setSelectedTool={setSelectedTool}
            />
          ) : (
            <Tools
              isAnimating={isAnimating}
              isToolbarVisible={isToolbarVisible}
              key='tools'
              selectedTool={selectedTool}
              sendMessage={sendMessage}
              setIsToolbarVisible={setIsToolbarVisible}
              setSelectedTool={setSelectedTool}
              tools={toolsByArtifactKind}
            />
          )}
        </motion.div>
      </TooltipProvider>
    )
  }

export default memo(PureToolbar, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false
  if (prevProps.isToolbarVisible !== nextProps.isToolbarVisible) return false
  if (prevProps.artifactKind !== nextProps.artifactKind) return false
  return true
})
