import dynamic from 'next/dynamic'

export default dynamic(async () => import('~/components/create-portal'), { ssr: false })
