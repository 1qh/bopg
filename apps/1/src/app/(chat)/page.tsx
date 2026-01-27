import { cookies } from 'next/headers'
import { Suspense } from 'react'

import { DEFAULT_CHAT_MODEL } from '~/ai/models'
import Chat from '~/components/chat'
import DataStreamHandler from '~/components/data-stream-handler'
import { randomId } from '~/utils'

const NewChatPage = async () => {
  const cookieStore = await cookies(),
    modelIdFromCookie = cookieStore.get('chat-model'),
    id = randomId()
  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={modelIdFromCookie ? modelIdFromCookie.value : DEFAULT_CHAT_MODEL}
        initialMessages={[]}
        initialVisibilityType='private'
        isReadonly={false}
        key={id}
      />
      <DataStreamHandler />
    </>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className='flex h-dvh' />}>
      <NewChatPage />
    </Suspense>
  )
}
