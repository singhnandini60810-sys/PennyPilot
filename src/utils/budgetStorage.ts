import type { Budget } from "../types/budget";

export const BUDGET_STORAGE_KEY =
  "pennypilot-budgets";

export const BUDGET_UPDATED_EVENT =
  "pennypilot-budget-updated";

export function loadBudgets(): Budget[] {
  try {
    const storedBudgets = localStorage.getItem(
      BUDGET_STORAGE_KEY,
    );

    if (!storedBudgets) {
      return [];
    }

    const parsedBudgets = JSON.parse(
      storedBudgets,
    ) as Budget[];

    if (!Array.isArray(parsedBudgets)) {
      return [];
    }

    return parsedBudgets.filter(
      (budget) =>
        typeof budget.id === "string" &&
        typeof budget.category === "string" &&
        typeof budget.amount === "number" &&
        budget.amount > 0,
    );
  } catch {
    return [];
  }
}

export function saveBudgets(
  budgets: Budget[],
): void {
  localStorage.setItem(
    BUDGET_STORAGE_KEY,
    JSON.stringify(budgets),
  );

  window.dispatchEvent(
    new CustomEvent(BUDGET_UPDATED_EVENT, {
      detail: budgets,
    }),
  );
}

export function createBudget(
  category: string,
  amount: number,
  period: Budget["period"],
): Budget {
  const now = new Date().toISOString();

  return {
    id:
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`,

    category,
    amount,
    period,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateStoredBudget(
  budgets: Budget[],
  budgetId: string,
  updates: Pick<
    Budget,
    "category" | "amount" | "period"
  >,
): Budget[] {
  return budgets.map((budget) =>
    budget.id === budgetId
      ? {
          ...budget,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : budget,
  );
}

export function deleteStoredBudget(
  budgets: Budget[],
  budgetId: string,
): Budget[] {
  return budgets.filter(
    (budget) => budget.id !== budgetId,
  );
}