'use client'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { useSidebar } from '@a/ui/sidebar'
import { PanelLeft, Plus, SquarePen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useEffect } from 'react'

import type { VisibilityType } from './visibility-selector'

import VisibilitySelector from './visibility-selector'

interface ChatHeaderProps {
  chatId: string
  isReadonly: boolean
  selectedVisibilityType: VisibilityType
}

const PureChatHeader = ({ chatId, isReadonly, selectedVisibilityType }: ChatHeaderProps) => {
  const { open, setOpenMobile, toggleSidebar } = useSidebar(),
    router = useRouter()
  useEffect(() => {
    setOpenMobile(false)
  }, [chatId])
  return (
    <header className='absolute inset-x-0 top-1 z-1 flex items-center px-1'>
      <Button
        className={cn(open && '-translate-x-11 animate-[fadeIn_3s]')}
        onClick={toggleSidebar}
        size='icon'
        variant='ghost'>
        <PanelLeft />
      </Button>
      {open ? null : (
        <button
          className='group flex items-center gap-1 rounded-lg p-1.5 pr-3 text-[0px] tracking-tight transition-all duration-500 hover:bg-sidebar hover:text-sm'
          onClick={() => {
            router.push('/')
            router.refresh()
          }}
          type='button'>
          <Plus className='stroke-1 transition-all duration-1000 group-hover:size-0 group-hover:rotate-[-540deg]' />
          <SquarePen className='mr-1 size-0 rotate-180 transition-all duration-1000 group-hover:size-4 group-hover:rotate-0' />
          New chat
        </button>
      )}
      <p className='grow' />
      {!isReadonly && <VisibilitySelector chatId={chatId} selectedVisibilityType={selectedVisibilityType} />}
    </header>
  )
}
export default memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
)
