import type { ReactNode } from 'react'

import CreatePost from '~/common/create-post'
import Login from '~/common/login'
import ThemeToggle from '~/components/theme-toggle'

const Layout = ({ children }: { children: ReactNode }) => (
  <div className='p-2.5'>
    <ThemeToggle className='absolute top-1 right-1' />
    <Login />
    <div className='mx-auto max-w-2xl'>
      <CreatePost />
      {children}
    </div>
  </div>
)

export default Layout
