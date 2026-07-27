import {
  BarChart3,
  LayoutDashboard,
  PiggyBank,
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
    icon: BarChart3,
  },
  {
    label: 'Savings',
    path: '/savings',
    icon: PiggyBank,
  },
]