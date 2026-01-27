import { cn } from '@a/ui'
import { Spinner } from '@a/ui/spinner'

interface ImageEditorProps {
  content: string
  isInline: boolean
  status: string
  title: string
}

export const ImageEditor = ({ content, isInline, status, title }: ImageEditorProps) => (
  <div
    className={cn('flex w-full items-center justify-center', {
      'h-[200px]': isInline,
      'h-[calc(100dvh-60px)]': !isInline
    })}>
    {status === 'streaming' ? (
      <div className='flex items-center gap-4'>
        {!isInline && <Spinner />}
        <div>Generating Image...</div>
      </div>
    ) : (
      <picture>
        {/** biome-ignore lint/correctness/useImageSize: x */}
        <img
          alt={title}
          className={cn('h-fit w-full max-w-200', {
            'p-0 md:p-20': !isInline
          })}
          src={`data:image/png;base64,${content}`}
        />
      </picture>
    )}
  </div>
)
