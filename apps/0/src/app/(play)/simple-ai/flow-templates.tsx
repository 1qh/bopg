'use client'

import { startCase } from 'es-toolkit/string'
import Image from 'next/image'
import Link from 'next/link'

import BlurFade from '~/components/blur-fade'

import { FLOW_TEMPLATES } from './template/[id]/flow-templates'

const FlowTemplates = () => (
  <>
    <div className='group mx-auto my-10 w-fit rounded-full border bg-muted py-1 select-none'>
      ✨ or start with a template
    </div>
    <div className='mx-auto grid w-fit grid-cols-1 gap-5 pb-48 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {FLOW_TEMPLATES.map((e, i) => (
        <div
          className='group relative z-0 [transition:z-index_0ms_432ms] hover:z-2 hover:[transition:z-index_0ms_0ms]'
          key={e.template}>
          <div className='pointer-events-none fixed inset-0 z-1 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-black/60' />
          <BlurFade As='div' className='relative z-2 h-24 w-72' delay={0.12 * i}>
            <Link
              className='flex h-25 w-72 items-start gap-4 overflow-hidden rounded-2xl bg-background p-4 text-sm drop-shadow-sm transition-all delay-200 duration-500 hover:h-60 hover:-translate-y-2 hover:scale-[102%] hover:shadow-lg hover:drop-shadow-xl active:scale-90 active:delay-0'
              href={`/simple-ai/template/${e.template}`}>
              <Image
                alt=''
                className='absolute inset-0 top-1/2 -z-1 w-72 -translate-y-1/2 opacity-50 blur-2xl brightness-150 dark:brightness-50'
                height={100}
                src={`/ava/${e.ava}.svg`}
                width={100}
              />
              <div className='size-17 shrink-0 overflow-hidden rounded-xl'>
                <Image
                  alt=''
                  className='size-17 drop-shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl'
                  height={100}
                  src={`/ava/${e.ava}.svg`}
                  width={100}
                />
              </div>
              <div>
                <p className='-mt-1.5 text-base/4 font-medium text-balance'>{startCase(e.template)}</p>
                <div className='h-16 overflow-hidden text-xs/4 font-light text-foreground/70 transition-all delay-200 duration-500 group-hover:h-96'>
                  {e.description}
                  <ul className='mt-1.5 list-disc pl-3 font-light text-muted-foreground'>
                    <li>{e.nodes.length} nodes</li>
                    <li>{e.edges.length} edges</li>
                  </ul>
                </div>
              </div>
            </Link>
          </BlurFade>
        </div>
      ))}
    </div>
  </>
)

export default FlowTemplates
