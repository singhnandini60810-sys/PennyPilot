import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useExpenses } from "../hooks/useExpenses";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../types/expense";
import type { Expense, ExpenseFormData } from "../types/expense";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

import "../components/expenses/expenses.css";

const EMPTY_FORM: ExpenseFormData = {
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  payment_method: "UPI",
  notes: "",
};

export default function ExpensesPage() {
  const {
    expenses,
    loading,
    saving,
    error,
    addExpense,
    editExpense,
    removeExpense,
    clearError,
  } = useExpenses();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const visibleExpenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...expenses]
      .filter((expense) => {
        const matchesSearch =
          expense.title.toLowerCase().includes(normalizedSearch) ||
          expense.category.toLowerCase().includes(normalizedSearch) ||
          expense.payment_method.toLowerCase().includes(normalizedSearch);

        const matchesCategory =
          categoryFilter === "All" || expense.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort(
        (firstExpense, secondExpense) =>
          new Date(secondExpense.date).getTime() -
          new Date(firstExpense.date).getTime(),
      );
  }, [expenses, search, categoryFilter]);

  const totalVisibleAmount = visibleExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  function openAddForm() {
    clearError();
    setEditingExpense(null);
    setFormData({
      ...EMPTY_FORM,
      date: new Date().toISOString().split("T")[0],
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    clearError();
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
      payment_method: expense.payment_method,
      notes: expense.notes ?? "",
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setIsFormOpen(false);
    setEditingExpense(null);
    setFormError("");
  }

  function updateField(
    field: keyof ExpenseFormData,
    value: ExpenseFormData[keyof ExpenseFormData],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Please enter an expense title.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError("Please enter an amount greater than zero.");
      return;
    }

    try {
      if (editingExpense) {
        await editExpense(editingExpense.expense_id, {
          ...formData,
          title: formData.title.trim(),
          amount: Number(formData.amount),
          notes: formData.notes.trim(),
        });
      } else {
        await addExpense({
          ...formData,
          title: formData.title.trim(),
          amount: Number(formData.amount),
          notes: formData.notes.trim(),
        });
      }

      closeForm();
    } catch {
      // Context already stores the API error.
    }
  }

  async function confirmDelete() {
    if (!deleteExpense) return;

    try {
      await removeExpense(deleteExpense.expense_id);
      setDeleteExpense(null);
    } catch {
      // Context already stores the API error.
    }
  }

  return (
    <section className="expenses-page">
      <div className="expenses-page__heading">
        <div>
          <h1>Expenses</h1>
          <p>Add, search, edit and remove your recorded expenses.</p>
        </div>

        <button
          className="expenses-primary-button"
          type="button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add expense
        </button>
      </div>

      <div className="expenses-summary">
        <div>
          <span>Showing</span>
          <strong>{visibleExpenses.length} expenses</strong>
        </div>

        <div>
          <span>Displayed total</span>
          <strong>{formatCurrency(totalVisibleAmount)}</strong>
        </div>
      </div>

      <div className="expenses-toolbar">
        <label className="expenses-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            placeholder="Search expenses..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          className="expenses-filter"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="All">All categories</option>

          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="expenses-error">
          <span>{error}</span>

          <button type="button" onClick={clearError}>
            <X size={17} />
          </button>
        </div>
      )}

      <div className="expenses-table-card">
        {loading ? (
          <div className="expenses-state">
            <div className="expenses-loader" />
            <p>Loading expenses...</p>
          </div>
        ) : visibleExpenses.length === 0 ? (
          <div className="expenses-state">
            <div className="expenses-state__icon">
              <ReceiptText size={30} />
            </div>

            <h2>No expenses found</h2>

            <p>
              {expenses.length === 0
                ? "Add your first expense to begin tracking your spending."
                : "Try changing your search or category filter."}
            </p>

            {expenses.length === 0 && (
              <button
                className="expenses-primary-button"
                type="button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add expense
              </button>
            )}
          </div>
        ) : (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {visibleExpenses.map((expense) => (
                  <tr key={expense.expense_id}>
                    <td>
                      <div className="expense-title-cell">
                        <strong>{expense.title}</strong>

                        {expense.notes && <span>{expense.notes}</span>}
                      </div>
                    </td>

                    <td>
                      <span className="expense-category">
                        {expense.category}
                      </span>
                    </td>

                    <td>{formatDate(expense.date)}</td>

                    <td>{expense.payment_method}</td>

                    <td className="expense-amount">
                      {formatCurrency(Number(expense.amount))}
                    </td>

                    <td>
                      <div className="expense-actions">
                        <button
                          type="button"
                          aria-label={`Edit ${expense.title}`}
                          onClick={() => openEditForm(expense)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="expense-action--danger"
                          type="button"
                          aria-label={`Delete ${expense.title}`}
                          onClick={() => setDeleteExpense(expense)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="expense-modal-backdrop" onMouseDown={closeForm}>
          <div
            className="expense-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="expense-modal__header">
              <div>
                <h2 id="expense-form-title">
                  {editingExpense ? "Edit expense" : "Add expense"}
                </h2>

                <p>
                  {editingExpense
                    ? "Update the selected expense details."
                    : "Record a new expense in PennyPilot."}
                </p>
              </div>

              <button type="button" onClick={closeForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            <form className="expense-form" onSubmit={handleSubmit}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.title}
                  placeholder="Example: Grocery shopping"
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                />
              </label>

              <div className="expense-form__row">
                <label>
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    placeholder="0.00"
                    onChange={(event) =>
                      updateField("amount", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      updateField("date", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="expense-form__row">
                <label>
                  <span>Category</span>
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Payment method</span>
                  <select
                    value={formData.payment_method}
                    onChange={(event) =>
                      updateField("payment_method", event.target.value)
                    }
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Notes</span>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.notes}
                  placeholder="Optional notes about this expense"
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                />
              </label>

              {(formError || error) && (
                <p className="expense-form__error">{formError || error}</p>
              )}

              <div className="expense-form__actions">
                <button
                  className="expenses-secondary-button"
                  type="button"
                  disabled={saving}
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  className="expenses-primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingExpense
                      ? "Save changes"
                      : "Add expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteExpense && (
        <div
          className="expense-modal-backdrop"
          onMouseDown={() => !saving && setDeleteExpense(null)}
        >
          <div
            className="expense-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="expense-delete-dialog__icon">
              <Trash2 size={25} />
            </div>

            <h2>Delete expense?</h2>

            <p>
              This will permanently remove <strong>{deleteExpense.title}</strong>{" "}
              from DynamoDB.
            </p>

            <div className="expense-form__actions">
              <button
                className="expenses-secondary-button"
                type="button"
                disabled={saving}
                onClick={() => setDeleteExpense(null)}
              >
                Cancel
              </button>

              <button
                className="expenses-danger-button"
                type="button"
                disabled={saving}
                onClick={() => void confirmDelete()}
              >
                {saving ? "Deleting..." : "Delete expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}