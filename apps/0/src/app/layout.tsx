import '@a/ui/globals.css'
import '@xyflow/react/dist/style.css'

import type { Viewport } from 'next'
import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import { Toaster } from '@a/ui/sonner'
import { ReactFlowProvider } from '@xyflow/react'
import { Provider } from 'jotai'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'

import IntlErrorHandling from '~/i18n/provider'
import { TRPCReactProvider } from '~/trpc/react'

const font = Inter({ subsets: ['vietnamese'] })
// eslint-disable-next-line one-var
const jb = JetBrains_Mono({ subsets: ['vietnamese'], variable: '--font-mono' })

export const viewport: Viewport = {
  themeColor: [
    { color: 'white', media: '(prefers-color-scheme: light)' },
    { color: 'black', media: '(prefers-color-scheme: dark)' }
  ]
}

const Wrapper = async ({ children }: LayoutProps) => (
  <html lang={await getLocale()} suppressHydrationWarning>
    <body
      className={cn(
        'flex min-h-screen bg-background font-sans tracking-tight text-foreground antialiased',
        font.className,
        jb.variable
      )}>
      <Provider>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <TRPCReactProvider>
            <NuqsAdapter>
              <ReactFlowProvider>
                <NextIntlClientProvider>
                  <IntlErrorHandling>{children}</IntlErrorHandling>
                </NextIntlClientProvider>
              </ReactFlowProvider>
            </NuqsAdapter>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </Provider>
    </body>
  </html>
)

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => (
  <Suspense fallback={null}>
    <Wrapper>{children}</Wrapper>
  </Suspense>
)

export default Layout
