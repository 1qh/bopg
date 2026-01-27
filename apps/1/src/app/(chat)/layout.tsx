import type { User } from '@a/db/schema'
import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@a/ui/sidebar'
import { cookies } from 'next/headers'
import Script from 'next/script'
import { Suspense } from 'react'

import { getSession } from '~/auth/server'
import AppSidebar from '~/components/app-sidebar'
import { DataStreamProvider } from '~/components/data-stream-provider'

const SidebarWrapper = async ({ children }: LayoutProps) => {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()]),
    isCollapsed = cookieStore.get('sidebar_state')?.value !== 'true'

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={session?.user as User} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => (
  <>
    <Script src='https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js' strategy='beforeInteractive' />
    <DataStreamProvider>
      <Suspense fallback={<div className='flex h-dvh' />}>
        <SidebarWrapper>{children}</SidebarWrapper>
      </Suspense>
    </DataStreamProvider>
  </>
)

export default Layout
