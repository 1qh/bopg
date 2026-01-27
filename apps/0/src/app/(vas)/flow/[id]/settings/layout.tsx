'use client'

import type { ReactNode } from 'react'
import type { LinkGroup } from 'types'

import { cn } from '@a/ui'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@a/ui/resizable'
import {
  Album,
  AudioLines,
  Braces,
  Brain,
  Cog,
  Database,
  Languages,
  Lightbulb,
  Phone,
  Settings,
  Workflow,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Fragment } from 'react'

import NavActive from '~/components/nav-active'

const route = '/flow/',
  linkGroups: LinkGroup[] = [
    {
      groupName: '',
      links: [
        {
          href: '',
          Icon: Settings,
          title: 'General'
        }
      ]
    },
    {
      groupName: 'Main',
      links: [
        {
          href: '/variables',
          Icon: Braces,
          title: 'Variables'
        },
        {
          href: '/agent-tools',
          Icon: Wrench,
          title: 'Agent tools'
        }
      ]
    },
    {
      groupName: 'Analysis',
      links: [
        {
          href: '/analysis/data-collection',
          Icon: Database,
          title: 'Data Collection'
        },
        {
          href: '/analysis/summary',
          Icon: Lightbulb,
          title: 'Summary'
        }
      ]
    },
    {
      groupName: 'Other',
      links: [
        {
          href: '/other/llm',
          Icon: Brain,
          title: 'LLM'
        },
        {
          href: '/other/nlp',
          Icon: Languages,
          title: 'NLP'
        },
        {
          href: '/other/audio-talk',
          Icon: AudioLines,
          title: 'Audio Talk'
        },
        {
          href: '/other/spoken-dictionary',
          Icon: Album,
          title: 'Spoken Dictionary'
        },
        {
          href: '/other/call-center',
          Icon: Phone,
          title: 'Call Center'
        },
        {
          href: '/other/advanced',
          Icon: Cog,
          title: 'Advanced'
        }
      ]
    }
  ]

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { id } = useParams<{ id: string }>(),
    prefix = `${route}${id}`,
    pathname = usePathname(),
    currentTitle = linkGroups.flatMap(g => g.links).find(({ href }) => pathname === `${prefix}/settings${href}`)?.title
  return (
    <>
      <Link className='fixed top-1 right-1' href={prefix}>
        <Workflow className='size-8 rounded-lg bg-background stroke-1 p-1.5 transition-all duration-200 hover:bg-muted hover:stroke-2' />
      </Link>
      <ResizablePanelGroup className='mx-auto max-h-screen max-w-5xl *:h-full *:py-10' orientation='horizontal'>
        <ResizablePanel className='no-scrollbar min-w-52 overflow-auto! pl-2' defaultSize={1}>
          {linkGroups.map(({ groupName, links }) => (
            <Fragment key={groupName}>
              {groupName.length ? (
                <p className='mt-3 mb-2 ml-3 border-t pt-4 text-sm font-medium text-muted-foreground/60'>{groupName}</p>
              ) : null}
              {links.map(({ href, Icon, title }) => {
                const path = `${prefix}/settings${href}`,
                  active = pathname === path
                return (
                  <Link
                    className={cn(
                      'relative mt-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-muted',
                      active ? 'bg-muted font-semibold text-foreground' : 'font-normal text-foreground/70'
                    )}
                    href={path}
                    key={title}>
                    <NavActive active={active} />
                    <Icon className='size-4' />
                    {title}
                  </Link>
                )
              })}
            </Fragment>
          ))}
        </ResizablePanel>
        <ResizableHandle className='bg-transparent bg-linear-to-r from-transparent from-50% via-60% to-transparent to-70% px-3 hover:via-border/50' />
        <ResizablePanel className='no-scrollbar overflow-auto! px-0.75' defaultSize={3}>
          <p className='mt-0.5 mb-5 border-b pb-3 text-4xl font-medium tracking-tight'>{currentTitle}</p>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}

export default Layout
