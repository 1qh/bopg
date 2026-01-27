import type { ReactNode } from 'react'

const MinimalTable = ({ children, headers }: { children: ReactNode; headers: string[] }) => (
  <table className='group mx-auto w-[calc(100%-8px)] max-w-6xl'>
    <tbody>
      <tr className='h-10 border-b capitalize transition-all duration-300 *:px-0.5 *:pb-0.5 *:text-left *:text-sm *:font-medium group-hover:border-transparent'>
        {headers.map(h => (
          <th key={h}>{h}</th>
        ))}
      </tr>
      {children}
    </tbody>
  </table>
)

export default MinimalTable
