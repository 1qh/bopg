/** biome-ignore-all lint/performance/noImgElement: x */
import { Loader } from '@a/ui/ai-elements/loader'
import { Button } from '@a/ui/button'
import { X } from 'lucide-react'

import type { Attachment } from '~/types'

const PreviewAttachment = ({
  attachment: { contentType, name, url },
  isUploading = false,
  onRemove
}: {
  attachment: Attachment
  isUploading?: boolean
  onRemove?: () => void
}) => (
  <div className='group relative size-14 overflow-hidden rounded-lg'>
    {contentType.startsWith('image') ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={name.length ? name : ''} className='size-full object-cover' height={48} src={url} width={48} />
    ) : (
      <div className='flex size-full items-center justify-center text-xs text-muted-foreground'>File</div>
    )}
    {isUploading ? (
      <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
        <Loader size={16} />
      </div>
    ) : null}
    {onRemove && !isUploading ? (
      <Button
        className='absolute -top-1.5 -right-1.5 size-6 rounded-full opacity-0 group-hover:opacity-100'
        onClick={onRemove}
        size='icon'
        type='button'
        variant='outline'>
        <X className='size-3' />
      </Button>
    ) : null}
  </div>
)

export default PreviewAttachment
