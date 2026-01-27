import H from '~/components/h'

import Cc from '../(dev)/call-center/page'
import Cs from '../(dev)/client-settings/page'
import In from '../(dev)/interruption/page'
import Ot from '../(dev)/other/page'

const Page = () => (
  <>
    <div className='relative'>
      <H>Interruption</H>
      <p className='text-sm text-muted-foreground'>
        When disabled, the agent will ignore user interruption and speak until the end of response
      </p>
      <In />
    </div>
    <H className='border-t'>Call Center Settings</H>
    <p className='mb-5 text-sm text-muted-foreground'>
      The following key-value pairs will be sent from the Agent to the Call Center along with the Agent’s response in each
      turn. These settings apply only when the Agent is integrated with a telephony service client.
    </p>
    <Cc />
    <H className='border-t'>Client Settings</H>
    <p className='mb-5 text-sm text-muted-foreground'>
      The following key-value pairs will be sent from the Agent to the Client along with the Agent’s response in each turn.
    </p>
    <Cs />
    <H className='border-t'>Other</H>
    <Ot />
  </>
)

export default Page
