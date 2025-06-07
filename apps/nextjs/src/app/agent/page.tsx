import Link from 'next/link'
import { titleCase } from 'text-case'

import { AGENT_EXAMPLES } from '~/agent-examples'
import ThemeToggle from '~/components/theme-toggle'

const Page = () => (
  <div className='px-8'>
    <p className='my-5 text-4xl font-light'>Agent Template</p>
    <div className='flex flex-wrap gap-5'>
      {AGENT_EXAMPLES.map(e => (
        <Link
          className='group w-52 rounded-xl border px-5 pt-3 pb-4 text-sm shadow transition-all duration-300 hover:-translate-y-1 hover:scale-[102%] hover:shadow-lg hover:drop-shadow-xl'
          href={`/template/${e.id}`}
          key={e.id}>
          <p className='text-base transition-all duration-300 group-hover:text-blue-500'>{titleCase(e.id)}</p>
          <ul className='mt-1 list-disc pl-4 font-light text-muted-foreground'>
            <li>{e.nodes.length} nodes</li>
            <li>{e.edges.length} edges</li>
          </ul>
        </Link>
      ))}
    </div>
    <ThemeToggle className='fixed top-1 right-1' />
  </div>
)

export default Page
