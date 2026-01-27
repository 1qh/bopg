import Image from 'next/image'

import { isText } from '~/utils'

interface FileViewerProps {
  src: string
  type: string
}

const FileViewer = ({ src, type }: FileViewerProps) =>
  isText(type) ? (
    <pre>{src}</pre>
  ) : type.includes('image') ? (
    <Image alt='' fill objectFit='contain' src={src} />
  ) : type.includes('audio') ? (
    <audio controls>
      <track kind='captions' />
      <source src={src} />
    </audio>
  ) : null

export default FileViewer
