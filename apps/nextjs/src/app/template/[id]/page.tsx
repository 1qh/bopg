import { AGENT_EXAMPLES } from '~/agent-examples'

import FlowPreview from './flow'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params,
    agent = AGENT_EXAMPLES.find(a => a.id === id)
  if (!agent) return 'Template not found'

  return (
    <div className='h-screen w-screen'>
      <FlowPreview {...agent} />
    </div>
  )
}
