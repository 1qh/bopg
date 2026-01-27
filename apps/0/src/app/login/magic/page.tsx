'use client'

import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

import authClient from '~/auth/client'

const Page = () => {
  const [email, setEmail] = useState(''),
    [sending, setSending] = useState(false),
    [submitted, setSubmitted] = useState(false)

  return submitted ? (
    <div>
      <p className='mb-2 text-3xl font-light tracking-tighter'>We&#39;ve sent a log in link to your email</p>
      <p className='text-sm text-muted-foreground'>If you don&#39;t see the email, check your spam folder</p>
    </div>
  ) : (
    <form
      className='flex gap-2'
      // eslint-disable-next-line @typescript-eslint/strict-void-return
      onSubmit={async e => {
        e.preventDefault()
        setSending(true)
        const { data, error } = await authClient.signIn.magicLink({ email })
        if (error) toast.error(error.message)
        if (data?.status) {
          setSubmitted(true)
          return
        }
        setSending(false)
      }}>
      <Input onChange={e => setEmail(e.target.value)} placeholder='Enter your email' required type='email' value={email} />
      <Button disabled={sending} type='submit'>
        {sending ? 'Sending...' : 'Log in'}
      </Button>
    </form>
  )
}
export default Page
