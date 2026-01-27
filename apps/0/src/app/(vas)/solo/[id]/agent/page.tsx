import H from '~/components/h'

import Bp from '../(dev)/business-process/page'
import Ct from '../(dev)/custom-tools/page'
import St from '../(dev)/settings/page'
import Ec from '../(dev)/system-tools/end_call/page'
import Kr from '../(dev)/system-tools/knowledge_retrieval/page'
import Tn from '../(dev)/system-tools/transfer_to_number/page'

const Page = () => (
  <>
    <H>Business Process</H>
    <Bp />
    <H>System Tools</H>
    <div className='relative mt-6 rounded-2xl border p-5 pt-4'>
      <p className='-mb-1 text-lg font-semibold'>End Call</p>
      <p className='text-sm text-muted-foreground'>Give agent the ability to end the call</p>
      <Ec />
    </div>
    <div className='relative mt-6 rounded-2xl border p-5 pt-4'>
      <p className='-mb-1 text-lg font-semibold'>Transfer to Number</p>
      <p className='text-sm text-muted-foreground'>Give agent the ability to transfer the call to a human</p>
      <Tn />
    </div>
    <div className='relative mt-6 rounded-2xl border p-5 pt-4'>
      <p className='-mb-1 text-lg font-semibold'>Knowledge Retrieval</p>
      <p className='text-sm text-muted-foreground'>Provide LLM with domain-specific information from KE service</p>
      <Kr />
    </div>
    <H>Custom Tools</H>
    <Ct />
    <H className='mb-3 border-t'>Other</H>
    <St />
  </>
)

export default Page
