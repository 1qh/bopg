import '@a/ui/globals.css'
import '@xyflow/react/dist/style.css'

import type { ReactNode } from 'react'

import { auth } from '@a/auth'
import { cn } from '@a/ui'
import { ReactFlowProvider } from '@xyflow/react'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { TRPCReactProvider } from '~/trpc/react'

const Layout = async ({ children }: { children: ReactNode }) => (
  <html lang='en' suppressHydrationWarning>
    <body
      className={cn(
        'min-h-screen bg-background font-sans tracking-tight text-foreground antialiased',
        GeistSans.variable,
        GeistMono.variable
      )}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <TRPCReactProvider>
          <SessionProvider session={await auth()}>
            <ReactFlowProvider>{children}</ReactFlowProvider>
          </SessionProvider>
        </TRPCReactProvider>
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
)

export default Layout
