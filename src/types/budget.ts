export type BudgetPeriod = "monthly" | "weekly";

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: BudgetPeriod;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  period: BudgetPeriod;
}