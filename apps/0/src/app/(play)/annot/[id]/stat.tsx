import { Bar, BarChart, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { Stat } from '~/types'

const PerformanceTooltip = ({ active, label, payload }: TooltipProps) => {
    if (active && payload?.length)
      return (
        <div className='rounded-lg bg-background px-3 py-2 drop-shadow-xl'>
          <p className='text-center font-semibold'>{`${label}`}</p>
          {payload.map((entry, i) => (
            <p key={entry.dataKey + i} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      )
    return null
  },
  VolumeTooltip = ({ active, label, payload }: TooltipProps) => {
    if (active && payload?.length) {
      const { correct, count } = payload[0]?.payload ?? { correct: 0, count: 0 }
      return (
        <div className='rounded-lg bg-background px-3 py-2 drop-shadow-xl'>
          <p className='text-center font-semibold'>{`${label}`}</p>
          {payload.map((entry, i) => (
            <p className='capitalize' key={entry.dataKey + i} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
          <p>{`Coverage: ${((correct / count) * 100).toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

interface TooltipProps {
  active?: boolean
  label?: string
  payload?: {
    color: string
    dataKey: string
    payload: Pick<Stat, 'correct' | 'count'>
    value: number
  }[]
}

const StatsDashboard = ({ data }: { data: (Stat & { k: string })[] }) => (
  <>
    <h2>Performance Metrics</h2>
    <ResponsiveContainer height={360}>
      <BarChart className='opacity-60' data={data}>
        <XAxis dataKey='k' />
        <YAxis domain={[0, 1]} />
        <Tooltip content={<PerformanceTooltip />} />
        <Legend />
        <Bar dataKey='f1' fill='red' name='F1 Score' />
        <Bar dataKey='precision' fill='orange' name='Precision' />
        <Bar dataKey='recall' fill='teal' name='Recall' />
      </BarChart>
    </ResponsiveContainer>
    <h2>Volume & Coverage</h2>
    <ResponsiveContainer height={360}>
      <ComposedChart className='opacity-60' data={data}>
        <XAxis dataKey='k' />
        <YAxis />
        <Tooltip content={<VolumeTooltip />} />
        <Legend />
        <Bar dataKey='count' fill='indigo' name='Ground Truth' />
        <Bar dataKey='correct' fill='violet' name='Correct Predictions' />
      </ComposedChart>
    </ResponsiveContainer>
    <table className='[&_td]:px-4 [&_td]:py-2 [&_td]:text-center [&_th]:py-3'>
      <thead>
        <tr className='bg-muted'>
          <th>Element</th>
          <th>Ground</th>
          <th>Correct</th>
          <th>Coverage</th>
          <th>F1</th>
          <th>Precision</th>
          <th>Recall</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr className='border-t' key={row.k}>
            <td>{row.k}</td>
            <td>{row.count}</td>
            <td>{row.correct}</td>
            <td>{((row.correct / row.count) * 100).toFixed(1)}%</td>
            <td>{row.f1}</td>
            <td>{row.precision}</td>
            <td>{row.recall}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

export default StatsDashboard
