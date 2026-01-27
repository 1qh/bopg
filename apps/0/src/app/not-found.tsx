import Link from 'next/link'

const Page = () => (
  <div className='flex h-screen w-full items-center justify-center'>
    <Link
      className='text-8xl font-thin tracking-tighter text-input transition-all duration-500 hover:font-light hover:text-blue-500'
      href='/'>
      Not found! Go back home
    </Link>
  </div>
)

export default Page
