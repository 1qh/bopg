import H from '~/components/h'

import Cs from '../(dev)/conversation-summary/page'
import Dc from '../(dev)/data-collection/page'
import Pl from '../(dev)/postprocess-lua/page'

const Page = () => (
  <>
    <H>Data Collection</H>
    <p className='mb-5 text-sm text-muted-foreground'>
      Define custom data specifications to extract from conversation transcripts. You can find the evaluations results for
      each conversation in the history tab
    </p>
    <Dc />
    <div className='relative'>
      <H>Conversation Summary</H>
      <p className='text-sm text-muted-foreground'>When enabled, the system will summarize the conversation at the end</p>
      <Cs />
    </div>
    <H>Postprocess Lua Script</H>
    <p className='mb-3 text-sm text-muted-foreground'>
      This LUA script executed after a call has ended. It can be used to process or transform conversation data
    </p>
    <Pl />
  </>
)

export default Page
