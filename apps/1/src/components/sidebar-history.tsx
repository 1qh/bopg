'use client'

import type { Chat } from '@a/db/schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@a/ui/alert-dialog'
import { useSidebar } from '@a/ui/sidebar'
import { Spinner } from '@a/ui/spinner'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import useSWRInfinite from 'swr/infinite'

import { fetcher } from '~/utils'

import ChatItem from './sidebar-history-item'

const PAGE_SIZE = 20

export const getChatHistoryPaginationKey = (pageIndex: number, previousPageData: ChatHistory) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (previousPageData && !previousPageData.hasMore) return null
    if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`
    const firstChatFromPage = previousPageData.chats.at(-1)
    if (!firstChatFromPage) return null
    return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`
  },
  SidebarHistory = () => {
    const { setOpenMobile } = useSidebar(),
      pathname = usePathname(),
      id = pathname.startsWith('/chat/') ? pathname.split('/')[2] : null,
      {
        data: paginatedChatHistories,
        isLoading,
        isValidating,
        mutate,
        setSize
      } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
        fallbackData: []
      }),
      router = useRouter(),
      [deleteId, setDeleteId] = useState<null | string>(null),
      [showDeleteDialog, setShowDeleteDialog] = useState(false),
      hasReachedEnd = paginatedChatHistories ? paginatedChatHistories.some(page => !page.hasMore) : false,
      hasEmptyChatHistory = paginatedChatHistories ? paginatedChatHistories.every(page => page.chats.length === 0) : false,
      handleDelete = () => {
        const chatToDelete = deleteId,
          isCurrentChat = pathname === `/chat/${chatToDelete}`
        setShowDeleteDialog(false)
        const deletePromise = fetch(`/api/chat?id=${chatToDelete}`, { method: 'DELETE' })
        toast.promise(deletePromise, {
          error: 'Failed to delete chat',
          loading: 'Deleting chat...',
          success: () => {
            mutate(chatHistories => {
              if (chatHistories)
                return chatHistories.map(chatHistory => ({
                  ...chatHistory,
                  chats: chatHistory.chats.filter(chat => chat.id !== chatToDelete)
                }))
            })
            if (isCurrentChat) {
              router.replace('/')
              router.refresh()
            }
            return 'Chat deleted successfully'
          }
        })
      }
    if (isLoading) return <Spinner className='m-auto' />
    if (hasEmptyChatHistory) return <p className='m-auto text-center text-sm text-muted-foreground'>No chats yet</p>
    return (
      <>
        {paginatedChatHistories
          ?.flatMap(p => p.chats)
          .map(chat => (
            <ChatItem
              chat={chat}
              isActive={chat.id === id}
              key={chat.id}
              onDelete={chatId => {
                setDeleteId(chatId)
                setShowDeleteDialog(true)
              }}
              setOpenMobile={setOpenMobile}
            />
          ))}
        <motion.div
          onViewportEnter={() => {
            if (!(isValidating || hasReachedEnd)) setSize(size => size + 1)
          }}
        />
        {hasReachedEnd ? (
          <p className='mx-auto mt-auto animate-[fadeOut_2s_forwards] stroke-1 text-sm select-none'>All chats loaded 🎉</p>
        ) : (
          <Spinner className='mx-auto' />
        )}
        <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your chat and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

export interface ChatHistory {
  chats: Chat[]
  hasMore: boolean
}
