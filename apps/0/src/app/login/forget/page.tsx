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
      <p className='mb-2 text-3xl font-light tracking-tighter'>We&#39;ve sent a password reset link to your email</p>
      <p className='text-sm text-muted-foreground'>If you don&#39;t see the email, check your spam folder</p>
    </div>
  ) : (
    <form
      className='w-64 space-y-2'
      // eslint-disable-next-line @typescript-eslint/strict-void-return
      onSubmit={async e => {
        e.preventDefault()
        setSending(true)
        try {
          await authClient.requestPasswordReset({ email, redirectTo: '/login/reset' })
          setSubmitted(true)
        } catch {
          toast.error('An error occurred. Please try again.')
        } finally {
          setSending(false)
        }
      }}>
      <p className='text-center text-2xl font-light tracking-tighter text-muted-foreground'>Reset password</p>
      <Input onChange={e => setEmail(e.target.value)} placeholder='Enter your email' required type='email' value={email} />
      <Button className='w-full' disabled={sending} type='submit'>
        {sending ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  )
}
export default Page
