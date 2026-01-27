'use client'

import type { User } from '@a/db/schema'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@a/ui/dropdown-menu'
import { Spinner } from '@a/ui/spinner'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import { unstable_serialize } from 'swr/infinite'

import authClient from '~/auth/client'

import { getChatHistoryPaginationKey } from './sidebar-history'

const SidebarUserNav = ({ user }: { user: User }) => {
  const router = useRouter(),
    { isPending } = authClient.useSession(),
    { resolvedTheme, setTheme } = useTheme(),
    { mutate } = useSWRConfig(),
    handleDeleteAll = () => {
      const deletePromise = fetch('/api/history', { method: 'DELETE' })
      toast.promise(deletePromise, {
        error: 'Failed to delete all chats',
        loading: 'Deleting all chats...',
        success: () => {
          mutate(unstable_serialize(getChatHistoryPaginationKey))
          router.push('/')
          router.refresh()
          return 'All chats deleted successfully'
        }
      })
    }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted'>
        {isPending ? (
          <Spinner />
        ) : (
          <>
            <Image
              alt=''
              className='rounded-full'
              height={16}
              src={`https://avatar.vercel.sh/${user.isAnonymous ? 'guest' : user.email}`}
              width={16}
            />
            {user.isAnonymous ? 'Guest' : user.email}
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className='capitalize' onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          {resolvedTheme === 'light' ? 'dark' : 'light'} mode
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDeleteAll}>Delete all chats</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className='w-full'
            onClick={() => {
              if (isPending) {
                toast.error('Checking authentication status, please try again!')
                return
              }
              if (user.isAnonymous) router.push('/login')
              else authClient.signOut()
            }}
            type='button'>
            {user.isAnonymous ? 'Log in' : 'Log out'}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SidebarUserNav
