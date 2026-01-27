import { Button } from '@a/ui/button'
import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth, getSession } from '~/auth/server'
import Typewriter from '~/components/typing'

const Page = async () => {
  const session = await getSession(),
    t = await getTranslations()
  return session ? (
    <div className='flex h-full items-center justify-center'>
      <Typewriter
        className='text-7xl font-thin tracking-tight text-muted-foreground/30'
        text={`Good ${new Intl.DateTimeFormat('en-US', { dayPeriod: 'long' }).format(new Date()).split(' ').pop()}, ${session.user.name}!`}
      />
      <form>
        <Button
          className='fixed top-3 right-3 bg-transparent font-light text-foreground shadow-none duration-500 hover:h-11 hover:rounded-lg hover:text-lg hover:font-medium hover:text-white'
          formAction={async () => {
            'use server'
            await auth.api.signOut({ headers: await headers() })
            redirect('/')
          }}
          variant='destructive'>
          {t('Log out of')} {session.user.email}
        </Button>
      </form>
    </div>
  ) : null
}

export default Page
