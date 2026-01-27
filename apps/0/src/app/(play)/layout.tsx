import type { ReactNode } from 'react'

import Nav from './nav'

const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <Nav />
    <div className='h-screen grow overflow-y-auto'>{children}</div>
  </>
)

export default Layout
