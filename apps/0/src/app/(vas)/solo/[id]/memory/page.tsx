import H from '~/components/h'

import Dv from '../(dev)/dynamic-variables/page'
import Il from '../(dev)/initialize-lua/page'

const Page = () => (
  <>
    <H>System Dynamic Variables</H>
    <p className='mb-5 text-sm text-muted-foreground'>
      Your agent has access to these automatically available system variables
    </p>
    <div className='-ml-1.5 flex gap-3'>
      <div className='w-fit rounded-xl border px-3 py-2'>
        <p className='font-mono font-bold'>utterance</p>
        <p className='text-sm text-muted-foreground'>Customer&apos;s latest spoken text</p>
      </div>
      <div className='w-fit rounded-xl border px-3 py-2'>
        <p className='font-mono font-bold'>$callTranscript</p>
        <p className='text-sm text-muted-foreground'>Transcript of the call up to now</p>
      </div>
    </div>
    <H>Dynamic Variables</H>
    <p className='mb-5 text-sm text-muted-foreground'>
      Inject runtime values into your agent’s messages, system prompts, and tools. This enables you to personalize each
      conversation with user-specific data without creating multiple agents.
    </p>
    <Dv />
    <H>Initialize Variables Lua Script</H>
    <p className='mb-3 text-sm text-muted-foreground'>
      This LUA script runs before Agent starts the conversation to initialize variables
    </p>
    <Il />
  </>
)

export default Page
