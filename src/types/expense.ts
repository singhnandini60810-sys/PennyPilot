export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other',
] as const

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface Expense {
  expense_id: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  payment_method: PaymentMethod
  notes?: string
  created_at: string
  updated_at: string
}

export interface ExpenseFormData {
  title: string
  amount: string
  category: ExpenseCategory
  date: string
  payment_method: PaymentMethod
  notes: string
}

export interface ExpenseApiResponse {
  message?: string
  expense?: Expense
  expenses?: Expense[]
  expense_id?: string
  error?: string
}

export type ExpenseSortOption =
  | 'newest'
  | 'oldest'
  | 'highest'
  | 'lowest'
  | 'title'

export interface ExpenseFilters {
  search: string
  category: ExpenseCategory | 'All'
  month: string
  sortBy: ExpenseSortOption
}