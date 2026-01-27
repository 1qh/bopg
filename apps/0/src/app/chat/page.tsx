'use client'

import { Textarea } from '@a/ui/textarea'
import { useRouter } from 'next/navigation'

import initChat from './action'

const Page = () => {
  const router = useRouter()
  return (
    <div className='flex h-screen grow'>
      <Textarea
        className='m-auto min-h-24 w-120 rounded-2xl p-5'
        name='ask'
        // eslint-disable-next-line @typescript-eslint/strict-void-return
        onKeyDown={async e => {
          const { currentTarget: t, key, shiftKey } = e,
            m = t.value.trim()
          if (!m || shiftKey || key !== 'Enter') return
          t.disabled = true
          const id = await initChat(m)
          if (id) router.push(`/chat/${id}`)
          t.value = ''
          t.disabled = false
        }}
        placeholder='Ask anything'
      />
    </div>
  )
}

export default Page
