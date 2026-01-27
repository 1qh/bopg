import type { XYPosition as XY } from '@xyflow/react'
import type { LanguageModelUsage } from 'ai'
import type { UsageData } from 'tokenlens/helpers'
import type { LucideIcon } from 'lucide-react'

interface HW {
  h: number
  w: number
}
type HWXY = HW & XY
type AppUsage = LanguageModelUsage & UsageData & { modelId?: string }
interface LinkItem {
  href: string
  Icon: LucideIcon
  title: string
}
interface LinkGroup {
  groupName: string
  links: (LinkItem & { subs?: Omit<LinkItem, 'Icon'>[] })[]
}

export type { HW, HWXY, AppUsage, LinkItem, LinkGroup }
