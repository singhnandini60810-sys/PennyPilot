import type {
  Expense,
  ExpenseApiResponse,
  ExpenseFormData,
} from '../types/expense'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

function getApiUrl(path = ''): string {
  if (!API_BASE_URL) {
    throw new Error(
      'PennyPilot API URL is not configured. Add VITE_API_BASE_URL to your .env file.',
    )
  }

  return `${API_BASE_URL}${path}`
}

async function parseApiResponse(
  response: Response,
): Promise<ExpenseApiResponse> {
  let result: ExpenseApiResponse

  try {
    result = (await response.json()) as ExpenseApiResponse
  } catch {
    result = {
      error: 'The server returned an invalid response.',
    }
  }

  if (!response.ok) {
    throw new Error(
      result.error ??
        result.message ??
        `Request failed with status ${response.status}.`,
    )
  }

  return result
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch(getApiUrl('/expenses'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const result = await parseApiResponse(response)

  return result.expenses ?? []
}

export async function createExpense(
  formData: ExpenseFormData,
): Promise<Expense> {
  const response = await fetch(getApiUrl('/expenses'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      payment_method: formData.payment_method,
      notes: formData.notes.trim(),
    }),
  })

  const result = await parseApiResponse(response)

  if (!result.expense) {
    throw new Error('The created expense was not returned by the server.')
  }

  return result.expense
}

export async function updateExpense(
  expenseId: string,
  formData: ExpenseFormData,
): Promise<Expense> {
  const response = await fetch(
    getApiUrl(`/expenses/${encodeURIComponent(expenseId)}`),
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
      }),
    },
  )

  const result = await parseApiResponse(response)

  if (!result.expense) {
    throw new Error('The updated expense was not returned by the server.')
  }

  return result.expense
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const response = await fetch(
    getApiUrl(`/expenses/${encodeURIComponent(expenseId)}`),
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  await parseApiResponse(response)
}