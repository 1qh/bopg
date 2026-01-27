import Image from 'next/image'

import { s3 } from '~/s3'

const Page = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params,
    file = s3.file(decodeURI(key)),
    { type } = await file.stat(),
    src = `data:${type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`
  return <Image alt={key} fill objectFit='contain' src={src} />
}

export default Page
