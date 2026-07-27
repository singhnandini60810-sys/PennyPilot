import {
  useContext,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  Edit3,
  Plus,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";

import { ExpenseContext } from "../context/ExpenseContext";

import type {
  Budget,
  BudgetFormData,
} from "../types/budget";

import {
  createBudget,
  deleteStoredBudget,
  loadBudgets,
  saveBudgets,
  updateStoredBudget,
} from "../utils/budgetStorage";

import "../components/budget/budget.css";

const EMPTY_FORM: BudgetFormData = {
  category: "",
  amount: "",
  period: "monthly",
};

function getCurrentMonthRange() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return {
    start,
    end,
  };
}

function getCurrentWeekRange() {
  const now = new Date();

  const start = new Date(now);

  const day = start.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + difference);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}

function formatBudgetCurrency(
  amount: number,
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetPage() {
const expenseContext = useContext(ExpenseContext);

if (!expenseContext) {
  throw new Error(
    "BudgetPage must be used inside ExpenseProvider.",
  );
}

const { expenses } = expenseContext;

  const [budgets, setBudgets] =
    useState<Budget[]>(loadBudgets);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingBudget, setEditingBudget] =
    useState<Budget | null>(null);

  const [formData, setFormData] =
    useState<BudgetFormData>(EMPTY_FORM);

  const [formError, setFormError] =
    useState("");

  const budgetDetails = useMemo(() => {
    return budgets.map((budget) => {
      const range =
        budget.period === "weekly"
          ? getCurrentWeekRange()
          : getCurrentMonthRange();

      const spent = expenses
        .filter((expense) => {
          const expenseDate = new Date(
            expense.date,
          );

          return (
            expense.category ===
              budget.category &&
            expenseDate >= range.start &&
            expenseDate <= range.end
          );
        })
        .reduce(
          (total, expense) =>
            total + Number(expense.amount),
          0,
        );

      const remaining = budget.amount - spent;

      const percentage =
        budget.amount > 0
          ? (spent / budget.amount) * 100
          : 0;

      return {
        ...budget,
        spent,
        remaining,
        percentage,
      };
    });
  }, [budgets, expenses]);

  const summary = useMemo(() => {
    return budgetDetails.reduce(
      (result, budget) => ({
        totalBudget:
          result.totalBudget + budget.amount,

        totalSpent:
          result.totalSpent + budget.spent,

        exceeded:
          result.exceeded +
          (budget.spent > budget.amount
            ? 1
            : 0),
      }),
      {
        totalBudget: 0,
        totalSpent: 0,
        exceeded: 0,
      },
    );
  }, [budgetDetails]);

  const remainingBudget =
    summary.totalBudget - summary.totalSpent;

  function openCreateModal() {
    setEditingBudget(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(budget: Budget) {
    setEditingBudget(budget);

    setFormData({
      category: budget.category,
      amount: String(budget.amount),
      period: budget.period,
    });

    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingBudget(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  }

  function handleSaveBudget() {
    const amount = Number(formData.amount);

    if (!formData.category.trim()) {
      setFormError(
        "Please select a budget category.",
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setFormError(
        "Please enter a valid budget amount.",
      );
      return;
    }

    const duplicateBudget = budgets.some(
      (budget) =>
        budget.category ===
          formData.category &&
        budget.period === formData.period &&
        budget.id !== editingBudget?.id,
    );

    if (duplicateBudget) {
      setFormError(
        `A ${formData.period} budget already exists for this category.`,
      );
      return;
    }

    let updatedBudgets: Budget[];

    if (editingBudget) {
      updatedBudgets = updateStoredBudget(
        budgets,
        editingBudget.id,
        {
          category: formData.category,
          amount,
          period: formData.period,
        },
      );
    } else {
      const newBudget = createBudget(
        formData.category,
        amount,
        formData.period,
      );

      updatedBudgets = [
        newBudget,
        ...budgets,
      ];
    }

    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
    closeModal();
  }

  function handleDeleteBudget(
    budgetId: string,
  ) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!shouldDelete) {
      return;
    }

    const updatedBudgets =
      deleteStoredBudget(
        budgets,
        budgetId,
      );

    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
  }

  return (
    <section className="budget-page">
      <header className="budget-page__header">
        <div>
          <span className="budget-page__eyebrow">
            Spending control
          </span>

          <h1>Budget Management</h1>

          <p>
            Set category budgets, monitor spending
            and identify areas where you are close to
            exceeding your limit.
          </p>
        </div>

        <button
          className="budget-page__add-button"
          type="button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add Budget
        </button>
      </header>

      <section className="budget-summary">
        <article className="budget-summary__card">
          <div className="budget-summary__icon">
            <Target size={21} />
          </div>

          <div>
            <span>Total budget</span>

            <strong>
              {formatBudgetCurrency(
                summary.totalBudget,
              )}
            </strong>

            <small>
              Across {budgets.length} budgets
            </small>
          </div>
        </article>

        <article className="budget-summary__card">
          <div className="budget-summary__icon">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Total spent</span>

            <strong>
              {formatBudgetCurrency(
                summary.totalSpent,
              )}
            </strong>

            <small>
              Current budget periods
            </small>
          </div>
        </article>

        <article className="budget-summary__card">
          <div className="budget-summary__icon">
            <WalletCards size={21} />
          </div>

          <div>
            <span>Remaining</span>

            <strong>
              {formatBudgetCurrency(
                remainingBudget,
              )}
            </strong>

            <small>
              Available budget amount
            </small>
          </div>
        </article>

        <article className="budget-summary__card">
          <div className="budget-summary__icon">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>Exceeded</span>

            <strong>
              {summary.exceeded}
            </strong>

            <small>
              Budgets above their limit
            </small>
          </div>
        </article>
      </section>

      {budgetDetails.length === 0 ? (
        <section className="budget-empty-state">
          <div>
            <Target size={34} />
          </div>

          <h2>No budgets created yet</h2>

          <p>
            Create your first category budget to
            begin tracking your spending limits.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Create first budget
          </button>
        </section>
      ) : (
        <section className="budget-list">
          <div className="budget-list__header">
            <div>
              <h2>Your budgets</h2>

              <p>
                Progress is calculated from your
                current expense data.
              </p>
            </div>

            <span>
              {budgetDetails.length} active
            </span>
          </div>

          <div className="budget-grid">
            {budgetDetails.map((budget) => {
              const isExceeded =
                budget.percentage > 100;

              const isWarning =
                budget.percentage >= 80 &&
                !isExceeded;

              const progressWidth = Math.min(
                budget.percentage,
                100,
              );

              return (
                <article
                  className={
                    isExceeded
                      ? "budget-card budget-card--exceeded"
                      : isWarning
                        ? "budget-card budget-card--warning"
                        : "budget-card"
                  }
                  key={budget.id}
                >
                  <div className="budget-card__header">
                    <div>
                      <span className="budget-card__category">
                        {budget.category}
                      </span>

                      <span className="budget-card__period">
                        <CalendarDays size={14} />

                        {budget.period ===
                        "weekly"
                          ? "Weekly budget"
                          : "Monthly budget"}
                      </span>
                    </div>

                    <div className="budget-card__actions">
                      <button
                        type="button"
                        aria-label={`Edit ${budget.category} budget`}
                        onClick={() =>
                          openEditModal(budget)
                        }
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete ${budget.category} budget`}
                        onClick={() =>
                          handleDeleteBudget(
                            budget.id,
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="budget-card__values">
                    <div>
                      <span>Spent</span>

                      <strong>
                        {formatBudgetCurrency(
                          budget.spent,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Limit</span>

                      <strong>
                        {formatBudgetCurrency(
                          budget.amount,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="budget-card__progress">
                    <div
                      className="budget-card__progress-bar"
                      style={{
                        width: `${progressWidth}%`,
                      }}
                    />
                  </div>

                  <div className="budget-card__footer">
                    <span>
                      {Math.round(
                        budget.percentage,
                      )}
                      % used
                    </span>

                    <strong>
                      {budget.remaining >= 0
                        ? `${formatBudgetCurrency(
                            budget.remaining,
                          )} left`
                        : `${formatBudgetCurrency(
                            Math.abs(
                              budget.remaining,
                            ),
                          )} over`}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {isModalOpen && (
        <div
          className="budget-modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <section
            className="budget-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="budget-modal__header">
              <div>
                <span>
                  {editingBudget
                    ? "Update limit"
                    : "New spending limit"}
                </span>

                <h2 id="budget-modal-title">
                  {editingBudget
                    ? "Edit Budget"
                    : "Add Budget"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close budget modal"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="budget-modal__content">
              <label>
                <span>Category</span>

                <input
                  type="text"
                  placeholder="Example: Food"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        category:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label>
                <span>Budget amount</span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Example: 5000"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        amount:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label>
                <span>Budget period</span>

                <select
                  value={formData.period}
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        period:
                          event.target
                            .value as BudgetFormData["period"],
                      }),
                    )
                  }
                >
                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>
                </select>
              </label>

              {formError && (
                <p className="budget-modal__error">
                  {formError}
                </p>
              )}
            </div>

            <footer className="budget-modal__footer">
              <button
                type="button"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveBudget}
              >
                {editingBudget
                  ? "Save Changes"
                  : "Create Budget"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}