'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '~/auth/server'
import { api } from '~/trpc/server'

const initChat = async (message: string) => {
  const { response } = await auth.api.getSession({ headers: await headers(), returnHeaders: true }),
    user = response?.user
  if (!user) redirect('/login')
  const chat = await api.conversation.insert({ title: message })
  if (!chat || Array.isArray(chat)) throw new Error('Failed to create chat')
  revalidatePath('/chat', 'layout')
  return chat.id
}

export default initChat
