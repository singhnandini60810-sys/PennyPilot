import { format, isValid, parseISO } from 'date-fns'

export function formatExpenseDate(date: string): string {
  const parsedDate = parseISO(date)

  if (!isValid(parsedDate)) {
    return date
  }

  return format(parsedDate, 'dd MMM yyyy')
}

export function formatShortDate(date: string): string {
  const parsedDate = parseISO(date)

  if (!isValid(parsedDate)) {
    return date
  }

  return format(parsedDate, 'dd MMM')
}