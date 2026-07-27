import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  PiggyBank,
  ReceiptText,
  RefreshCw,
  Tag,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SummaryCard from "../components/dashboard/SummaryCard";
import { useExpenses } from "../hooks/useExpenses";
import type { Expense } from "../types/expense";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

import "../components/dashboard/dashboard.css";

interface ChartDataItem {
  date: string;
  label: string;
  amount: number;
  transactions: number;
}

interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  notes: string;
  createdAt: string;
}

interface NamedTotal {
  name: string;
  amount: number;
  transactions: number;
}

const SAVINGS_STORAGE_KEY =
  "pennypilot-savings-goals";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getValidDate(date: string): Date | null {
  const parsedDate = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function getExpenseTimestamp(
  expense: Expense,
): number {
  const expenseDate =
    getValidDate(expense.date)?.getTime() ?? 0;

  const createdDate = expense.created_at
    ? new Date(expense.created_at).getTime()
    : 0;

  return expenseDate + createdDate;
}

function loadSavingsGoals(): SavingGoal[] {
  try {
    const savedGoals = localStorage.getItem(
      SAVINGS_STORAGE_KEY,
    );

    if (!savedGoals) {
      return [];
    }

    const parsedGoals = JSON.parse(savedGoals);

    if (!Array.isArray(parsedGoals)) {
      return [];
    }

    return parsedGoals.filter(
      (goal): goal is SavingGoal =>
        typeof goal?.id === "string" &&
        typeof goal?.title === "string" &&
        typeof goal?.targetAmount === "number" &&
        typeof goal?.savedAmount === "number",
    );
  } catch {
    return [];
  }
}

function getHighestNamedTotal(
  totals: Record<string, NamedTotal>,
): NamedTotal | null {
  const values = Object.values(totals);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((highest, current) =>
    current.amount > highest.amount
      ? current
      : highest,
  );
}

function getMostUsedItem(
  totals: Record<string, NamedTotal>,
): NamedTotal | null {
  const values = Object.values(totals);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((highest, current) => {
    if (
      current.transactions >
      highest.transactions
    ) {
      return current;
    }

    if (
      current.transactions ===
        highest.transactions &&
      current.amount > highest.amount
    ) {
      return current;
    }

    return highest;
  });
}

export default function DashboardPage() {
  const {
    expenses,
    loading,
    error,
    refreshExpenses,
  } = useExpenses();

  const [savingsGoals, setSavingsGoals] =
    useState<SavingGoal[]>(loadSavingsGoals);

  useEffect(() => {
    function refreshSavingsData() {
      setSavingsGoals(loadSavingsGoals());
    }

    refreshSavingsData();

    window.addEventListener(
      "focus",
      refreshSavingsData,
    );

    window.addEventListener(
      "storage",
      refreshSavingsData,
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshSavingsData,
      );

      window.removeEventListener(
        "storage",
        refreshSavingsData,
      );
    };
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalExpense = useMemo(
    () =>
      expenses.reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0,
      ),
    [expenses],
  );

  const thisMonthExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const expenseDate =
          getValidDate(expense.date);

        return (
          expenseDate?.getMonth() ===
            currentMonth &&
          expenseDate?.getFullYear() ===
            currentYear
        );
      }),
    [
      expenses,
      currentMonth,
      currentYear,
    ],
  );

  const thisMonthTotal = useMemo(
    () =>
      thisMonthExpenses.reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0,
      ),
    [thisMonthExpenses],
  );

  const largestExpense = useMemo<Expense | null>(
    () => {
      if (expenses.length === 0) {
        return null;
      }

      return expenses.reduce(
        (largest, expense) =>
          Number(expense.amount) >
          Number(largest.amount)
            ? expense
            : largest,
      );
    },
    [expenses],
  );

  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort(
          (firstExpense, secondExpense) =>
            getExpenseTimestamp(
              secondExpense,
            ) -
            getExpenseTimestamp(
              firstExpense,
            ),
        )
        .slice(0, 6),
    [expenses],
  );

  const categoryTotals = useMemo(() => {
    return expenses.reduce<
      Record<string, NamedTotal>
    >((totals, expense) => {
      const category =
        expense.category || "Other";

      if (!totals[category]) {
        totals[category] = {
          name: category,
          amount: 0,
          transactions: 0,
        };
      }

      totals[category].amount +=
        Number(expense.amount);

      totals[category].transactions += 1;

      return totals;
    }, {});
  }, [expenses]);

  const paymentMethodTotals = useMemo(() => {
    return expenses.reduce<
      Record<string, NamedTotal>
    >((totals, expense) => {
      const paymentMethod =
        expense.payment_method || "Other";

      if (!totals[paymentMethod]) {
        totals[paymentMethod] = {
          name: paymentMethod,
          amount: 0,
          transactions: 0,
        };
      }

      totals[paymentMethod].amount +=
        Number(expense.amount);

      totals[paymentMethod].transactions += 1;

      return totals;
    }, {});
  }, [expenses]);

  const highestCategory =
    getHighestNamedTotal(categoryTotals);

  const mostUsedPaymentMethod =
    getMostUsedItem(paymentMethodTotals);

  const thisMonthUniqueDays = useMemo(() => {
    return new Set(
      thisMonthExpenses.map(
        (expense) => expense.date,
      ),
    ).size;
  }, [thisMonthExpenses]);

  const averageDailyExpense =
    thisMonthUniqueDays > 0
      ? thisMonthTotal / thisMonthUniqueDays
      : 0;

  const chartData = useMemo<ChartDataItem[]>(() => {
    const dailyTotals = expenses.reduce<
      Record<
        string,
        {
          amount: number;
          transactions: number;
        }
      >
    >((totals, expense) => {
      if (!totals[expense.date]) {
        totals[expense.date] = {
          amount: 0,
          transactions: 0,
        };
      }

      totals[expense.date].amount +=
        Number(expense.amount);

      totals[expense.date].transactions += 1;

      return totals;
    }, {});

    return Object.entries(dailyTotals)
      .sort(
        (
          [firstDate],
          [secondDate],
        ) =>
          new Date(
            `${firstDate}T00:00:00`,
          ).getTime() -
          new Date(
            `${secondDate}T00:00:00`,
          ).getTime(),
      )
      .slice(-12)
      .map(
        ([
          date,
          information,
        ]): ChartDataItem => ({
          date,
          label: new Date(
            `${date}T00:00:00`,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          amount: information.amount,
          transactions:
            information.transactions,
        }),
      );
  }, [expenses]);

  const totalSavingsTarget = useMemo(
    () =>
      savingsGoals.reduce(
        (total, goal) =>
          total + goal.targetAmount,
        0,
      ),
    [savingsGoals],
  );

  const totalSaved = useMemo(
    () =>
      savingsGoals.reduce(
        (total, goal) =>
          total + goal.savedAmount,
        0,
      ),
    [savingsGoals],
  );

  const savingsRemaining = Math.max(
    totalSavingsTarget - totalSaved,
    0,
  );

  const savingsProgress =
    totalSavingsTarget > 0
      ? Math.min(
          (totalSaved / totalSavingsTarget) *
            100,
          100,
        )
      : 0;

  const completedSavingsGoals =
    savingsGoals.filter(
      (goal) =>
        goal.savedAmount >= goal.targetAmount,
    ).length;

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader" />

          <p>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-error">
          <CircleDollarSign size={32} />

          <div>
            <h2>Unable to load dashboard</h2>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              void refreshExpenses()
            }
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__heading">
        <div>
          <span className="dashboard-page__eyebrow">
            Financial overview
          </span>

          <h1>
            {getGreeting()}, Nandini 👋
          </h1>

          <p>
            Review your spending, savings and latest
            financial activity in one place.
          </p>
        </div>

        <Link
          className="dashboard-add-button"
          to="/expenses"
        >
          <ReceiptText size={18} />
          Manage expenses
        </Link>
      </header>

      <div className="dashboard-summary-grid">
        <SummaryCard
          title="Total Spending"
          value={formatCurrency(totalExpense)}
          icon={<WalletCards size={24} />}
          accent="blue"
        />

        <SummaryCard
          title="This Month"
          value={formatCurrency(thisMonthTotal)}
          icon={<CalendarDays size={24} />}
          accent="gold"
        />

        <SummaryCard
          title="Transactions"
          value={expenses.length.toString()}
          icon={<ReceiptText size={24} />}
          accent="blue"
        />

        <SummaryCard
          title="Largest Expense"
          value={formatCurrency(
            Number(largestExpense?.amount ?? 0),
          )}
          icon={<TrendingUp size={24} />}
          accent="gold"
        />
      </div>

      <section className="dashboard-insights">
        <div className="dashboard-section-heading">
          <div>
            <h2>Quick insights</h2>

            <p>
              Useful patterns calculated from your
              recorded expenses.
            </p>
          </div>
        </div>

        <div className="dashboard-insights-grid">
          <article className="dashboard-insight-card">
            <div className="dashboard-insight-card__icon">
              <Tag size={20} />
            </div>

            <div>
              <span>Largest category</span>

              <strong>
                {highestCategory?.name ??
                  "No data"}
              </strong>

              <small>
                {highestCategory
                  ? formatCurrency(
                      highestCategory.amount,
                    )
                  : "Add expenses to calculate"}
              </small>
            </div>
          </article>

          <article className="dashboard-insight-card">
            <div className="dashboard-insight-card__icon">
              <CreditCard size={20} />
            </div>

            <div>
              <span>Most-used payment</span>

              <strong>
                {mostUsedPaymentMethod?.name ??
                  "No data"}
              </strong>

              <small>
                {mostUsedPaymentMethod
                  ? `${mostUsedPaymentMethod.transactions} ${
                      mostUsedPaymentMethod.transactions ===
                      1
                        ? "transaction"
                        : "transactions"
                    }`
                  : "No payment data"}
              </small>
            </div>
          </article>

          <article className="dashboard-insight-card">
            <div className="dashboard-insight-card__icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>Average daily spend</span>

              <strong>
                {formatCurrency(
                  averageDailyExpense,
                )}
              </strong>

              <small>
                Based on active spending days this
                month
              </small>
            </div>
          </article>

          <article className="dashboard-insight-card">
            <div className="dashboard-insight-card__icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <span>Largest transaction</span>

              <strong>
                {largestExpense?.title ??
                  "No data"}
              </strong>

              <small>
                {largestExpense
                  ? `${largestExpense.category} · ${formatCurrency(
                      Number(
                        largestExpense.amount,
                      ),
                    )}`
                  : "No transactions available"}
              </small>
            </div>
          </article>
        </div>
      </section>

      <div className="dashboard-content-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Spending trend</h2>

              <p>
                Total spending across your latest
                recorded dates.
              </p>
            </div>

            {expenses.length > 0 && (
              <Link
                className="dashboard-panel__link"
                to="/reports"
              >
                View reports
              </Link>
            )}
          </div>

          {chartData.length > 0 ? (
            <div className="dashboard-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="rgba(46, 67, 101, 0.12)"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#6f7785",
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tick={{
                      fontSize: 12,
                      fill: "#6f7785",
                    }}
                    tickFormatter={(
                      value: number,
                    ): string =>
                      new Intl.NumberFormat(
                        "en-US",
                        {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        },
                      ).format(value)
                    }
                  />

                  <Tooltip
                    cursor={{
                      stroke:
                        "rgba(46, 67, 101, 0.18)",
                      strokeWidth: 1,
                    }}
                    formatter={(
                      value,
                    ): [string, string] => [
                      formatCurrency(
                        Number(value ?? 0),
                      ),
                      "Spending",
                    ]}
                    labelFormatter={(label) =>
                      String(label ?? "")
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#E59D2C"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#E59D2C",
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#2E4365",
                      strokeWidth: 0,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="dashboard-empty">
              <div className="dashboard-empty__content">
                <div className="dashboard-empty__icon">
                  <TrendingUp size={27} />
                </div>

                <h3>No spending trend yet</h3>

                <p>
                  Add your first expense to begin
                  tracking your spending.
                </p>
              </div>
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Recent activity</h2>

              <p>Your latest six transactions.</p>
            </div>

            {expenses.length > 0 && (
              <Link
                className="dashboard-panel__link"
                to="/expenses"
              >
                View all
              </Link>
            )}
          </div>

          {recentExpenses.length > 0 ? (
            <div className="recent-expenses">
              {recentExpenses.map((expense) => (
                <div
                  className="recent-expense"
                  key={expense.expense_id}
                >
                  <div className="recent-expense__icon">
                    <ReceiptText size={19} />
                  </div>

                  <div className="recent-expense__details">
                    <strong>
                      {expense.title}
                    </strong>

                    <span>
                      {expense.category} ·{" "}
                      {expense.payment_method}
                    </span>

                    <small>
                      {formatDate(expense.date)}
                    </small>
                  </div>

                  <div className="recent-expense__amount">
                    <strong>
                      {formatCurrency(
                        Number(expense.amount),
                      )}
                    </strong>

                    <ArrowUpRight size={15} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty dashboard-empty--small">
              <div className="dashboard-empty__content">
                <div className="dashboard-empty__icon">
                  <ReceiptText size={27} />
                </div>

                <h3>No expenses yet</h3>

                <p>
                  Your recently added expenses will
                  appear here.
                </p>
              </div>
            </div>
          )}
        </article>
      </div>

      <article className="dashboard-panel dashboard-savings">
        <div className="dashboard-panel__header">
          <div>
            <h2>Savings overview</h2>

            <p>
              Progress across your personal savings
              goals.
            </p>
          </div>

          <Link
            className="dashboard-panel__link"
            to="/savings"
          >
            View goals
          </Link>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="dashboard-savings-empty">
            <div className="dashboard-savings-empty__icon">
              <PiggyBank size={28} />
            </div>

            <div>
              <h3>No savings goals yet</h3>

              <p>
                Create your first savings target to
                start tracking progress.
              </p>
            </div>

            <Link
              className="dashboard-savings-empty__link"
              to="/savings"
            >
              Create goal
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="dashboard-savings-content">
            <div className="dashboard-savings-main">
              <div className="dashboard-savings-main__icon">
                <PiggyBank size={28} />
              </div>

              <div>
                <span>Total saved</span>

                <strong>
                  {formatCurrency(totalSaved)}
                </strong>

                <small>
                  {completedSavingsGoals} of{" "}
                  {savingsGoals.length} goals completed
                </small>
              </div>
            </div>

            <div className="dashboard-savings-progress">
              <div className="dashboard-savings-progress__heading">
                <span>Overall progress</span>

                <strong>
                  {savingsProgress.toFixed(0)}%
                </strong>
              </div>

              <div className="dashboard-savings-progress__track">
                <div
                  style={{
                    width: `${savingsProgress}%`,
                  }}
                />
              </div>

              <div className="dashboard-savings-progress__footer">
                <span>
                  {formatCurrency(
                    totalSavingsTarget,
                  )}{" "}
                  target
                </span>

                <span>
                  {formatCurrency(
                    savingsRemaining,
                  )}{" "}
                  remaining
                </span>
              </div>
            </div>

            <div className="dashboard-savings-goals">
              <div>
                <Target size={20} />

                <span>Total goals</span>

                <strong>
                  {savingsGoals.length}
                </strong>
              </div>

              <Link to="/savings">
                Manage savings
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}