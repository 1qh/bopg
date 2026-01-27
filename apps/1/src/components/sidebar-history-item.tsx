import type { Chat } from '@a/db/schema'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@a/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@a/ui/sidebar'
import { Check, Ellipsis, Globe, Lock, Share2, Trash } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import useChatVisibility from '~/hooks/use-chat-visibility'

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile
}: {
  chat: Chat
  isActive: boolean
  onDelete: (chatId: string) => void
  setOpenMobile: (open: boolean) => void
}) => {
  const { setVisibilityType, visibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility
  })
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className='rounded-none' isActive={isActive}>
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>
      <DropdownMenu modal>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover={!isActive}>
            <Ellipsis />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='center' side='right'>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Share2 />
              Share
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {(['private', 'public'] as const).map(v => (
                  <DropdownMenuItem className='capitalize' key={v} onClick={() => setVisibilityType(v)}>
                    {v === 'private' ? <Lock /> : <Globe />}
                    {v}
                    {visibilityType === v ? <Check className='ml-auto' /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={() => onDelete(chat.id)}>
            <Trash />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export default memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false
  return true
})
