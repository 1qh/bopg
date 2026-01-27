import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '~/auth/server'
import { api } from '~/trpc/server'

import Chat from './chat'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params,
    { response } = await auth.api.getSession({ headers: await headers(), returnHeaders: true }),
    user = response?.user,
    chat = await api.conversation.byId(id)
  if (!chat) redirect('/chat')
  return <Chat {...chat} own={chat.userId === user?.id} />
}

export default Page
