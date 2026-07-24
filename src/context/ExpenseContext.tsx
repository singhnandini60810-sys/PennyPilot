import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../services/expenseService";
import type {
  Expense,
  ExpenseFormData,
} from "../types/expense";

interface ExpenseContextValue {
  expenses: Expense[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshExpenses: () => Promise<void>;
  addExpense: (expenseData: ExpenseFormData) => Promise<Expense>;
  editExpense: (
    expenseId: string,
    expenseData: ExpenseFormData,
  ) => Promise<Expense>;
  removeExpense: (expenseId: string) => Promise<void>;
  clearError: () => void;
}

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseContext =
  createContext<ExpenseContextValue | undefined>(undefined);

export function ExpenseProvider({
  children,
}: ExpenseProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const refreshExpenses = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const fetchedExpenses = await getExpenses();

      setExpenses(fetchedExpenses);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load expenses.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = useCallback(
    async (expenseData: ExpenseFormData): Promise<Expense> => {
      try {
        setSaving(true);
        setError(null);

        const newExpense = await createExpense(expenseData);

        setExpenses((currentExpenses: Expense[]) => [
          newExpense,
          ...currentExpenses,
        ]);

        return newExpense;
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to add the expense.";

        setError(message);
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const editExpense = useCallback(
    async (
      expenseId: string,
      expenseData: ExpenseFormData,
    ): Promise<Expense> => {
      try {
        setSaving(true);
        setError(null);

        const updatedExpense = await updateExpense(
          expenseId,
          expenseData,
        );

        setExpenses((currentExpenses: Expense[]) =>
          currentExpenses.map((expense: Expense) =>
            expense.expense_id === expenseId
              ? updatedExpense
              : expense,
          ),
        );

        return updatedExpense;
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to update the expense.";

        setError(message);
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const removeExpense = useCallback(
    async (expenseId: string): Promise<void> => {
      try {
        setSaving(true);
        setError(null);

        await deleteExpense(expenseId);

        setExpenses((currentExpenses: Expense[]) =>
          currentExpenses.filter(
            (expense: Expense) =>
              expense.expense_id !== expenseId,
          ),
        );
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to delete the expense.";

        setError(message);
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  useEffect(() => {
    void refreshExpenses();
  }, [refreshExpenses]);

  const contextValue = useMemo<ExpenseContextValue>(
    () => ({
      expenses,
      loading,
      saving,
      error,
      refreshExpenses,
      addExpense,
      editExpense,
      removeExpense,
      clearError,
    }),
    [
      expenses,
      loading,
      saving,
      error,
      refreshExpenses,
      addExpense,
      editExpense,
      removeExpense,
      clearError,
    ],
  );

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
}