import type { ReactNode } from 'react'

import { Button } from '@a/ui/button'
import { Trash } from 'lucide-react'
import { refresh } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '~/auth/server'
import env from '~/env'
import { api } from '~/trpc/server'

import ChatLink from './chat-link'
import NewChat from './new-chat'

const Layout = async ({ children }: { children: ReactNode }) => {
  const { response } = await auth.api.getSession({ headers: await headers(), returnHeaders: true }),
    user = response?.user,
    chats = user ? await api.conversation.my() : []
  return (
    <div className='flex w-screen'>
      {user ? (
        <div className='flex w-72 flex-col border-r p-1.5'>
          <NewChat />
          {chats.length ? (
            chats.map(c => (
              <form
                action={async () => {
                  'use server'
                  await api.conversation.delete(c.id)
                  refresh()
                }}
                className='group flex w-full cursor-pointer items-center'
                key={c.id}>
                <ChatLink {...c} />
                {env.NODE_ENV === 'development' ? (
                  <Button
                    className='-ml-4 hidden rounded-lg bg-muted group-hover:flex hover:bg-destructive! hover:text-white'
                    size='icon-lg'
                    type='submit'
                    variant='ghost'>
                    <Trash className='stroke-1' />
                  </Button>
                ) : null}
              </form>
            ))
          ) : (
            <p className='m-auto text-center text-sm font-light text-muted-foreground'>No chats yet</p>
          )}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export default Layout
