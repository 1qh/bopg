import { Button } from '@a/ui/button'
import { X } from 'lucide-react'
import { memo } from 'react'

import { initialArtifactData, useArtifact } from '~/hooks/use-artifact'

const PureArtifactCloseButton = () => {
  const { setArtifact } = useArtifact()
  return (
    <Button
      onClick={() => setArtifact(a => (a.status === 'streaming' ? { ...a, isVisible: false } : initialArtifactData))}
      size='icon'
      variant='ghost'>
      <X />
    </Button>
  )
}

export default memo(PureArtifactCloseButton, () => true)
