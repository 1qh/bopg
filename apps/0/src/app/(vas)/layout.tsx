import type { ReactNode } from 'react'

import { headers } from 'next/headers'

import { auth } from '~/auth/server'

import Nav from './nav'

const Layout = async ({ children }: { children: ReactNode }) => {
  const { response } = await auth.api.getSession({ headers: await headers(), returnHeaders: true }),
    user = response?.user
  return (
    <>
      <Nav {...user} />
      <div className='grow'>{children}</div>
    </>
  )
}

export default Layout
