import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createExpense as createExpenseRequest,
  deleteExpense as deleteExpenseRequest,
  getExpenses,
  updateExpense as updateExpenseRequest,
} from '../services/expenseService'
import type {
  Expense,
  ExpenseFormData,
} from '../types/expense'

interface ExpenseContextValue {
  expenses: Expense[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  refreshExpenses: () => Promise<void>
  addExpense: (formData: ExpenseFormData) => Promise<Expense>
  editExpense: (
    expenseId: string,
    formData: ExpenseFormData,
  ) => Promise<Expense>
  removeExpense: (expenseId: string) => Promise<void>
  clearError: () => void
}

interface ExpenseProviderProps {
  children: ReactNode
}

const ExpenseContext = createContext<ExpenseContextValue | undefined>(
  undefined,
)

export function ExpenseProvider({ children }: ExpenseProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const expenseData = await getExpenses()

      const sortedExpenses = [...expenseData].sort(
        (first, second) =>
          new Date(second.date).getTime() -
          new Date(first.date).getTime(),
      )

      setExpenses(sortedExpenses)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load expenses.'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshExpenses()
  }, [refreshExpenses])

  const addExpense = useCallback(
    async (formData: ExpenseFormData): Promise<Expense> => {
      setIsSaving(true)
      setError(null)

      try {
        const createdExpense = await createExpenseRequest(formData)

        setExpenses((currentExpenses) =>
          [createdExpense, ...currentExpenses].sort(
            (first, second) =>
              new Date(second.date).getTime() -
              new Date(first.date).getTime(),
          ),
        )

        return createdExpense
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to add the expense.'

        setError(message)
        throw new Error(message)
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  const editExpense = useCallback(
    async (
      expenseId: string,
      formData: ExpenseFormData,
    ): Promise<Expense> => {
      setIsSaving(true)
      setError(null)

      try {
        const updatedExpense = await updateExpenseRequest(
          expenseId,
          formData,
        )

        setExpenses((currentExpenses) =>
          currentExpenses
            .map((expense) =>
              expense.expense_id === expenseId
                ? updatedExpense
                : expense,
            )
            .sort(
              (first, second) =>
                new Date(second.date).getTime() -
                new Date(first.date).getTime(),
            ),
        )

        return updatedExpense
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to update the expense.'

        setError(message)
        throw new Error(message)
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  const removeExpense = useCallback(
    async (expenseId: string): Promise<void> => {
      setIsSaving(true)
      setError(null)

      try {
        await deleteExpenseRequest(expenseId)

        setExpenses((currentExpenses) =>
          currentExpenses.filter(
            (expense) => expense.expense_id !== expenseId,
          ),
        )
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to delete the expense.'

        setError(message)
        throw new Error(message)
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      expenses,
      isLoading,
      isSaving,
      error,
      refreshExpenses,
      addExpense,
      editExpense,
      removeExpense,
      clearError,
    }),
    [
      expenses,
      isLoading,
      isSaving,
      error,
      refreshExpenses,
      addExpense,
      editExpense,
      removeExpense,
      clearError,
    ],
  )

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenseContext(): ExpenseContextValue {
  const context = useContext(ExpenseContext)

  if (!context) {
    throw new Error(
      'useExpenseContext must be used inside ExpenseProvider.',
    )
  }

  return context
}