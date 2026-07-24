import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
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
}

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

function getExpenseTimestamp(expense: Expense): number {
  const expenseDate = new Date(`${expense.date}T00:00:00`).getTime();
  const createdDate = expense.created_at
    ? new Date(expense.created_at).getTime()
    : 0;

  return expenseDate + createdDate;
}

export default function DashboardPage() {
  const { expenses, loading, error, refreshExpenses } = useExpenses();

  const typedExpenses: Expense[] = expenses;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalExpense = typedExpenses.reduce(
    (total: number, expense: Expense): number =>
      total + Number(expense.amount),
    0,
  );

  const thisMonthExpenses: Expense[] = typedExpenses.filter(
    (expense: Expense): boolean => {
      const expenseDate = new Date(`${expense.date}T00:00:00`);

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    },
  );

  const thisMonthTotal = thisMonthExpenses.reduce(
    (total: number, expense: Expense): number =>
      total + Number(expense.amount),
    0,
  );

  const largestExpense =
    typedExpenses.length > 0
      ? Math.max(
          ...typedExpenses.map((expense: Expense): number =>
            Number(expense.amount),
          ),
        )
      : 0;

  const recentExpenses: Expense[] = [...typedExpenses]
    .sort(
      (firstExpense: Expense, secondExpense: Expense): number =>
        getExpenseTimestamp(secondExpense) -
        getExpenseTimestamp(firstExpense),
    )
    .slice(0, 5);

  const dailyTotals = typedExpenses.reduce<Record<string, number>>(
    (
      totals: Record<string, number>,
      expense: Expense,
    ): Record<string, number> => {
      const currentAmount = totals[expense.date] ?? 0;

      totals[expense.date] =
        currentAmount + Number(expense.amount);

      return totals;
    },
    {},
  );

  const chartData: ChartDataItem[] = Object.entries(dailyTotals)
    .sort(
      (
        [firstDate]: [string, number],
        [secondDate]: [string, number],
      ): number =>
        new Date(`${firstDate}T00:00:00`).getTime() -
        new Date(`${secondDate}T00:00:00`).getTime(),
    )
    .slice(-10)
    .map(
      ([date, amount]: [string, number]): ChartDataItem => ({
        date,
        label: new Date(`${date}T00:00:00`).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          },
        ),
        amount,
      }),
    );

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader" />
          <p>Loading your expenses...</p>
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
            onClick={() => void refreshExpenses()}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-page__heading">
        <div>
          <h1>{getGreeting()}, Nandini 👋</h1>

          <p>
            Here is a clear overview of your spending and latest
            transactions.
          </p>
        </div>

        <Link
          className="dashboard-add-button"
          to="/expenses"
        >
          <ReceiptText size={18} />
          Manage expenses
        </Link>
      </div>

      <div className="dashboard-summary-grid">
        <SummaryCard
          title="Total Expense"
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
          value={typedExpenses.length.toString()}
          icon={<ReceiptText size={24} />}
          accent="blue"
        />

        <SummaryCard
          title="Largest Expense"
          value={formatCurrency(largestExpense)}
          icon={<TrendingUp size={24} />}
          accent="gold"
        />
      </div>

      <div className="dashboard-content-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Expense trend</h2>
              <p>Your spending across the latest recorded dates</p>
            </div>
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
                    tickFormatter={(value: number): string =>
                      new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                  />

                 <Tooltip
  cursor={{
    stroke: "rgba(46, 67, 101, 0.18)",
    strokeWidth: 1,
  }}
  formatter={(value) => [
    formatCurrency(Number(value ?? 0)),
    "Expense",
  ]}
  labelFormatter={(label) => String(label ?? "")}
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
                  Add your first expense to begin tracking your
                  spending.
                </p>
              </div>
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Recent expenses</h2>
              <p>Your latest five transactions</p>
            </div>

            {typedExpenses.length > 0 && (
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
              {recentExpenses.map((expense: Expense) => (
                <div
                  className="recent-expense"
                  key={expense.expense_id}
                >
                  <div className="recent-expense__icon">
                    <ReceiptText size={19} />
                  </div>

                  <div className="recent-expense__details">
                    <strong>{expense.title}</strong>

                    <span>
                      {expense.category} ·{" "}
                      {formatDate(expense.date)}
                    </span>
                  </div>

                  <div className="recent-expense__amount">
                    <strong>
                      {formatCurrency(Number(expense.amount))}
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
                  Your recently added expenses will appear here.
                </p>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}