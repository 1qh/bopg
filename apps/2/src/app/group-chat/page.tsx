import { api } from '@a/cv'
import { Conversation, ConversationScrollButton } from '@a/ui/ai-elements/conversation'
import { convexAuthNextjsToken as tok } from '@convex-dev/auth/nextjs/server'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { revalidatePath } from 'next/cache'

import Logout from '~/components/auth-pop'

import Messages from './messages'
import Submit from './submit'

const Page = async () => {
  const token = await tok(),
    { user } = api,
    { _id: userId } = await fetchQuery(user.me, {}, { token })
  return (
    <div className='flex h-dvh flex-col'>
      <Conversation>
        <Messages userId={userId} />
        <ConversationScrollButton />
      </Conversation>
      <div className='flex items-end gap-2 p-2'>
        <Logout />
        <form
          action={async (fd: FormData) => {
            'use server'
            const m = fd.get('input')
            if (typeof m !== 'string' || !m.trim()) return
            await fetchMutation(api.message.create, { body: m }, { token })
            revalidatePath('/')
          }}
          className='mx-auto'>
          <Submit className='max-h-36 w-96 rounded-2xl py-3' name='input' placeholder='Send a message...' />
        </form>
      </div>
    </div>
  )
}

export default Page
