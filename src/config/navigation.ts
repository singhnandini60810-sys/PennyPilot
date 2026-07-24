import {
  ChartNoAxesCombined,
  LayoutDashboard,
  ReceiptText,
} from 'lucide-react'

export const navigationItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: ReceiptText,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: ChartNoAxesCombined,
  },
]