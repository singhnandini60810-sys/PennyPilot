import type { ExpenseCategory } from '../types/expense'

export interface CategoryConfig {
  name: ExpenseCategory
  icon: string
  label: string
}

export const categoryConfig: CategoryConfig[] = [
  {
    name: 'Food',
    icon: 'Utensils',
    label: 'Food',
  },
  {
    name: 'Transport',
    icon: 'Car',
    label: 'Transport',
  },
  {
    name: 'Shopping',
    icon: 'ShoppingBag',
    label: 'Shopping',
  },
  {
    name: 'Bills',
    icon: 'ReceiptText',
    label: 'Bills',
  },
  {
    name: 'Education',
    icon: 'GraduationCap',
    label: 'Education',
  },
  {
    name: 'Health',
    icon: 'HeartPulse',
    label: 'Health',
  },
  {
    name: 'Entertainment',
    icon: 'Clapperboard',
    label: 'Entertainment',
  },
  {
    name: 'Other',
    icon: 'CircleEllipsis',
    label: 'Other',
  },
]
