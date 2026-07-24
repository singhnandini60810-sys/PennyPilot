import { useContext } from "react";

import { ExpenseContext } from "../context/ExpenseContext";

export function useExpenses() {
  const context = useContext(ExpenseContext);

  if (context === undefined) {
    throw new Error(
      "useExpenses must be used inside an ExpenseProvider.",
    );
  }

  return context;
}