import type { ReactNode } from 'react'

import { motion } from 'motion/react'

interface BlurFadeProps {
  animate?: boolean
  As?: 'div' | 'tr'
  children: ReactNode
  className?: string
  delay?: number
  yOffset?: number
}

const BlurFade = ({ animate = true, As = 'div', children, className, delay = 0, yOffset = 0 }: BlurFadeProps) => {
  const Comp = animate ? motion[As] : As
  return (
    <Comp
      animate='visible'
      className={className}
      exit='hidden'
      initial='hidden'
      transition={{ delay, duration: 0.7, ease: 'easeOut' }}
      variants={{
        hidden: { filter: 'blur(5px)', opacity: 0, y: yOffset },
        visible: { filter: 'blur(0)', opacity: 1, y: 0 }
      }}>
      {children}
    </Comp>
  )
}

export default BlurFade
