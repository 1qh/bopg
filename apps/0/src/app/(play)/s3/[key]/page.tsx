import FileViewer from '~/components/file-viewer'
import { s3 } from '~/s3'
import { isText } from '~/utils'

const Page = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params,
    file = s3.file(decodeURI(key)),
    { type } = await file.stat(),
    src = isText(type)
      ? await file.text()
      : `data:${type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`
  return (
    <>
      <p className='text-center text-input'>{type}</p>
      <FileViewer src={src} type={type} />
    </>
  )
}

export default Page
