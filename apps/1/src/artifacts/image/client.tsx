import { Copy, Redo, Undo } from 'lucide-react'
import { toast } from 'sonner'

import { Artifact } from '~/components/create-artifact'
import { ImageEditor } from '~/components/image-editor'

export default new Artifact({
  actions: [
    {
      description: 'Previous version',
      icon: <Undo />,
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
      onClick: ({ handleVersionChange }) => handleVersionChange('prev')
    },
    {
      description: 'Next version',
      icon: <Redo />,
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
      onClick: ({ handleVersionChange }) => handleVersionChange('next')
    },
    {
      description: 'Copy image to clipboard',
      icon: <Copy />,
      onClick: ({ content }) => {
        const img = new Image()
        img.src = `data:image/png;base64,${content}`
        // oxlint-disable unicorn/prefer-add-event-listener
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          }, 'image/png')
        }
        toast.success('Copied image to clipboard!')
      }
    }
  ],
  content: ImageEditor,
  description: 'Useful for image generation',
  kind: 'image',
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'data-imageDelta')
      setArtifact(a => ({
        ...a,
        content: streamPart.data,
        isVisible: true,
        status: 'streaming'
      }))
  },
  toolbar: []
})
