'use client'

import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import authClient from '~/auth/client'

const Page = () => {
  const [newPassword, setNewPassword] = useState(''),
    [confirmPw, setConfirmPw] = useState(''),
    [isSubmitting, setIsSubmitting] = useState(false),
    router = useRouter()
  return (
    <form
      className='w-64 space-y-2'
      // eslint-disable-next-line max-statements, @typescript-eslint/strict-void-return
      onSubmit={async e => {
        e.preventDefault()
        if (newPassword !== confirmPw) {
          toast.error('Passwords do not match')
          return
        }
        setIsSubmitting(true)
        const token = new URLSearchParams(globalThis.location.search).get('token')
        if (!token) {
          toast.error('No token found')
          return
        }
        const res = await authClient.resetPassword({ newPassword, token })
        if (res.error) toast.error(res.error.message)
        setIsSubmitting(false)
        router.push('/login/email')
      }}>
      <p className='text-center text-2xl font-light tracking-tighter text-muted-foreground'>Reset password</p>
      <Input
        autoComplete='password'
        onChange={e => setNewPassword(e.target.value)}
        placeholder='Password'
        type='password'
        value={newPassword}
      />
      <Input
        autoComplete='password'
        onChange={e => setConfirmPw(e.target.value)}
        placeholder='Confirm password'
        type='password'
        value={confirmPw}
      />
      <Button className='w-full' disabled={isSubmitting} type='submit'>
        {isSubmitting ? 'Resetting...' : 'Reset password'}
      </Button>
    </form>
  )
}
export default Page
