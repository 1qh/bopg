import FlowPreview from './flow-preview'
import { FLOW_TEMPLATES } from './flow-templates'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params,
    agent = FLOW_TEMPLATES.find(a => a.template === id)
  if (!agent) return 'Template not found'
  return <FlowPreview {...agent} />
}

export default Page
