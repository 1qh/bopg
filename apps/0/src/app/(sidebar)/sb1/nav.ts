import type { LucideIcon } from 'lucide-react'

import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Code,
  CreditCard,
  Database,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Mail,
  MessageSquare,
  Package,
  PieChart,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

interface NavEntry {
  href: string
  Icon: LucideIcon
  title: string
}

interface NavGroup {
  entries: NavEntry[]
  groupName: string
}

export const navGroups: NavGroup[] = [
  {
    entries: [
      {
        href: '/dashboard',
        Icon: Home,
        title: 'Overview'
      },
      {
        href: '/analytics',
        Icon: BarChart3,
        title: 'Analytics'
      }
    ],
    groupName: 'Dashboard'
  },
  {
    entries: [
      {
        href: '/documents',
        Icon: FileText,
        title: 'Documents'
      },
      {
        href: '/users',
        Icon: Users,
        title: 'User Management'
      }
    ],
    groupName: 'Content'
  },
  {
    entries: [
      {
        href: '/settings',
        Icon: Settings,
        title: 'Settings'
      },
      {
        href: '/security',
        Icon: Shield,
        title: 'Security'
      }
    ],
    groupName: 'Account'
  },
  {
    entries: [
      {
        href: '/billing',
        Icon: CreditCard,
        title: 'Payment Methods'
      },
      {
        href: '/notifications',
        Icon: Bell,
        title: 'Notifications'
      }
    ],
    groupName: 'Billing'
  },
  {
    entries: [
      {
        href: '/products',
        Icon: Package,
        title: 'Products'
      },
      {
        href: '/orders',
        Icon: ShoppingCart,
        title: 'Orders'
      }
    ],
    groupName: 'E-commerce'
  },
  {
    entries: [
      {
        href: '/messages',
        Icon: MessageSquare,
        title: 'Messages'
      },
      {
        href: '/email',
        Icon: Mail,
        title: 'Email Campaigns'
      }
    ],
    groupName: 'Communication'
  },
  {
    entries: [
      {
        href: '/calendar',
        Icon: Calendar,
        title: 'Calendar'
      },
      {
        href: '/timeline',
        Icon: Clock,
        title: 'Timeline'
      }
    ],
    groupName: 'Schedule'
  },
  {
    entries: [
      {
        href: '/api',
        Icon: Globe,
        title: 'API Management'
      },
      {
        href: '/database',
        Icon: Database,
        title: 'Database'
      }
    ],
    groupName: 'Integration'
  },
  {
    entries: [
      {
        href: '/code',
        Icon: Code,
        title: 'Code Editor'
      },
      {
        href: '/mobile',
        Icon: Smartphone,
        title: 'Mobile Apps'
      }
    ],
    groupName: 'Development'
  },
  {
    entries: [
      {
        href: '/help',
        Icon: HelpCircle,
        title: 'Help Center'
      },
      {
        href: '/documentation',
        Icon: BookOpen,
        title: 'Documentation'
      }
    ],
    groupName: 'Support'
  },
  {
    entries: [
      {
        href: '/campaigns',
        Icon: Zap,
        title: 'Campaigns'
      },
      {
        href: '/targets',
        Icon: Target,
        title: 'Target Audience'
      }
    ],
    groupName: 'Marketing'
  },
  {
    entries: [
      {
        href: '/growth',
        Icon: TrendingUp,
        title: 'Growth Metrics'
      },
      {
        href: '/insights',
        Icon: PieChart,
        title: 'Insights'
      }
    ],
    groupName: 'Reports'
  }
]
