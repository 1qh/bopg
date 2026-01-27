import '@a/ui/globals.css'
import type { ReactNode } from 'react'

import { Toaster } from '@a/ui/sonner'
import { ThemeProvider } from 'next-themes'

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang='en' suppressHydrationWarning>
    <body className='antialiased'>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <Toaster />
        {children}
      </ThemeProvider>
    </body>
  </html>
)

export const viewport = {
  maximumScale: 1
}
export default Layout
