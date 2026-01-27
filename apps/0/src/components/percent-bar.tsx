import { cn } from '@a/ui'

interface PercentBarProps {
  colors: string[]
  data: Record<string, number>
}

const PercentBar = ({ colors, data }: PercentBarProps) => {
  const entries = Object.entries(data),
    total = entries.reduce((sum, [, v]) => sum + v, 0)
  return (
    <>
      <div className='mt-1 mb-2 flex h-3 w-full overflow-hidden rounded-full'>
        {entries.map(([k, v], i) => {
          const percentage = (v / total) * 100
          return (
            <div
              className={colors[i % colors.length]}
              key={k}
              style={{ width: `${percentage}%` }}
              title={`${k}: ${v} (${percentage.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      {entries.map(([k, v], i) => (
        <div className='mt-1 flex items-center gap-1 px-1 font-light' key={k}>
          <p className={cn('size-3 rounded-full', colors[i % colors.length])} />
          <p className='w-5 text-center text-lg'>{v}</p>
          {k}
          <p className='ml-auto text-muted-foreground'>{((v / total) * 100).toFixed(1)}%</p>
        </div>
      ))}
    </>
  )
}

export default PercentBar
