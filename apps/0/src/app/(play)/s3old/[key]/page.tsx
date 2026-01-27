import FileViewer from '~/components/file-viewer'
import { isText } from '~/utils'

import { s3 } from '../s3'

const Page = async ({ params }: { params: Promise<{ key: string }> }) => {
  const key = decodeURI((await params).key),
    res = await s3.getObjectResponse(key)
  if (!res) return 'File not found'
  const type = res.headers.get('content-type')
  if (!type) return 'Cannot determine file type'

  const getSrc = async () => {
    if (isText(type)) return (await s3.getObject(key)) ?? 'Cannot read this file'
    const arrayBuffer = await s3.getObjectArrayBuffer(key)
    if (!arrayBuffer) return 'Cannot preview this file'
    return `data:${type};base64,${Buffer.from(arrayBuffer).toString('base64')}`
  }
  return (
    <>
      <p className='text-center text-input'>{type}</p>
      <FileViewer src={await getSrc()} type={type} />
    </>
  )
}

export default Page
