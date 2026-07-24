import {
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
} from 'date-fns'
import type { Expense, ExpenseCategory } from '../types/expense'

export interface ExpenseSummary {
  totalExpenses: number
  currentMonthExpenses: number
  highestExpense: number
  transactionCount: number
}

export interface CategoryTotal {
  category: ExpenseCategory
  amount: number
  percentage: number
}

export interface MonthlyTotal {
  month: string
  amount: number
}

export function calculateExpenseSummary(
  expenses: Expense[],
): ExpenseSummary {
  const currentDate = new Date()

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )

  const currentMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = parseISO(expense.date)
      return isSameMonth(expenseDate, currentDate)
    })
    .reduce((total, expense) => total + expense.amount, 0)

  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => expense.amount))
      : 0

  return {
    totalExpenses,
    currentMonthExpenses,
    highestExpense,
    transactionCount: expenses.length,
  }
}

export function calculateCategoryTotals(
  expenses: Expense[],
): CategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>()

  expenses.forEach((expense) => {
    const currentAmount = totals.get(expense.category) ?? 0
    totals.set(expense.category, currentAmount + expense.amount)
  })

  const totalExpenseAmount = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )

  return Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenseAmount > 0
          ? Number(((amount / totalExpenseAmount) * 100).toFixed(1))
          : 0,
    }))
    .sort((first, second) => second.amount - first.amount)
}

export function calculateMonthlyTotals(
  expenses: Expense[],
  numberOfMonths = 6,
): MonthlyTotal[] {
  const currentDate = new Date()

  const months = Array.from({ length: numberOfMonths }, (_, index) => {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (numberOfMonths - 1 - index),
      1,
    )

    return {
      date: monthDate,
      month: format(monthDate, 'MMM'),
      amount: 0,
    }
  })

  expenses.forEach((expense) => {
    const expenseDate = parseISO(expense.date)

    const matchingMonth = months.find(
      ({ date }) =>
        expenseDate >= startOfMonth(date) &&
        expenseDate <= endOfMonth(date),
    )

    if (matchingMonth) {
      matchingMonth.amount += expense.amount
    }
  })

  return months.map(({ month, amount }) => ({
    month,
    amount,
  }))
}