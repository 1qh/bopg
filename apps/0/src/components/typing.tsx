'use client'

import type { ComponentProps } from 'react'

import { useEffect, useState } from 'react'

interface TypewriterProps {
  delay?: number
  text: string
}

const Typewriter = ({ delay = 120, text, ...props }: ComponentProps<'p'> & TypewriterProps) => {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      if (i < text.length) setI(i + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [i])
  return <p {...props}>{text.slice(0, i)}</p>
}

export default Typewriter
