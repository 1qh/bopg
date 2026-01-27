'use client'

import type { User } from '@a/db/schema'

import { Button } from '@a/ui/button'
import { Sidebar } from '@a/ui/sidebar'
import { SquarePen } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { SidebarHistory } from '~/components/sidebar-history'
import SidebarUserNav from '~/components/sidebar-user-nav'

const AppSidebar = ({ user }: { user?: User }) => {
  const router = useRouter()
  return (
    <Sidebar className='z-0 border-none duration-700 ease-initial'>
      <Button
        className='m-1 w-fit tracking-tight'
        onClick={() => {
          router.push('/')
          router.refresh()
        }}
        variant='ghost'>
        <SquarePen />
        New chat
      </Button>
      <SidebarHistory />
      {user ? <SidebarUserNav user={user} /> : null}
    </Sidebar>
  )
}

export default AppSidebar
