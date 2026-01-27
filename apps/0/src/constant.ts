import type { LucideIcon } from 'lucide-react'
import type { LinkItem } from 'types'

import {
  CircleCheckBig,
  CloudUpload,
  Crop,
  Database,
  Home,
  ImageUp,
  ListCheck,
  MessagesSquare,
  MousePointerClick,
  Phone,
  Play,
  ScanFace,
  Share2,
  Split,
  Square,
  SquareDashedMousePointer
} from 'lucide-react'

type NodeType = (typeof nodeTypes)[number]

export const nodeTypes = ['agent', 'path', 'orchestrator', 'task', 'new-call', 'new-turn', 'end-call'] as const,
  startNodes = new Set<NodeType>(['end-call', 'new-call', 'new-turn']),
  nodeIcons: Record<NodeType, LucideIcon> = {
    agent: MousePointerClick,
    'end-call': Square,
    'new-call': Phone,
    'new-turn': Play,
    orchestrator: Share2,
    path: Split,
    task: CircleCheckBig
  },
  links: LinkItem[] = [
    {
      href: '/',
      Icon: Home,
      title: 'home'
    },
    {
      href: '/login',
      Icon: ScanFace,
      title: 'login'
    },
    {
      href: '/annot',
      Icon: Crop,
      title: 'annot'
    },
    {
      href: '/ollama',
      Icon: MessagesSquare,
      title: 'ollama'
    },
    {
      href: '/crud/infinity',
      Icon: CloudUpload,
      title: 'CRUD'
    },
    {
      href: '/gallery',
      Icon: ImageUp,
      title: 'gallery'
    },
    {
      href: '/bbox',
      Icon: SquareDashedMousePointer,
      title: 'bbox'
    },
    {
      href: '/s3',
      Icon: Database,
      title: 's3'
    },
    {
      href: '/queue',
      Icon: ListCheck,
      title: 'queue'
    }
  ],
  FORMDATA_ENTRY = 'whatever',
  MAX_SIZE = 5 * 1024 * 1024,
  Q = '{jobs}',
  VLM_MODEL = 'qwen3-vl:8b-thinking'

export type { NodeType }
