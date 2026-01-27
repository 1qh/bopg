'use client'

import type { ReactNode } from 'react'

import { LayoutProvider } from '@jalez/react-flow-automated-layout'

const Layout = ({ children }: { children: ReactNode }) => <LayoutProvider>{children}</LayoutProvider>

export default Layout
