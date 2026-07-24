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
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

import "../components/dashboard/dashboard.css";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
 const {
  expenses,
  isLoading: loading,
  error,
  refreshExpenses,
} = useExpenses();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(`${expense.date}T00:00:00`);

    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const thisMonthTotal = thisMonthExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const largestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

  const recentExpenses = [...expenses]
    .sort((firstExpense, secondExpense) => {
      const firstDate = new Date(firstExpense.date).getTime();
      const secondDate = new Date(secondExpense.date).getTime();

      return secondDate - firstDate;
    })
    .slice(0, 5);

  const dailyTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.date] =
        (totals[expense.date] ?? 0) + Number(expense.amount);

      return totals;
    },
    {},
  );

  const chartData = Object.entries(dailyTotals)
    .sort(
      ([firstDate], [secondDate]) =>
        new Date(firstDate).getTime() - new Date(secondDate).getTime(),
    )
    .slice(-10)
    .map(([date, amount]) => ({
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount,
    }));

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

          <button type="button" onClick={() => void refreshExpenses()}>
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
            Here is a clear overview of your spending and latest transactions.
          </p>
        </div>

        <Link className="dashboard-add-button" to="/expenses">
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
          value={expenses.length.toString()}
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
              <ResponsiveContainer width="100%" height="100%">
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
                    tickFormatter={(value: number) =>
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
                      formatCurrency(Number(value)),
                      "Expense",
                    ]}
                    labelFormatter={(_, payload) => {
                      const date = payload?.[0]?.payload?.date;

                      return date ? formatDate(date) : "";
                    }}
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
                <p>Add your first expense to begin tracking your spending.</p>
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

            {expenses.length > 0 && (
              <Link className="dashboard-panel__link" to="/expenses">
                View all
              </Link>
            )}
          </div>

          {recentExpenses.length > 0 ? (
            <div className="recent-expenses">
              {recentExpenses.map((expense) => (
                <div className="recent-expense" key={expense.expense_id}>
                  <div className="recent-expense__icon">
                    <ReceiptText size={19} />
                  </div>

                  <div className="recent-expense__details">
                    <strong>{expense.title}</strong>

                    <span>
                      {expense.category} · {formatDate(expense.date)}
                    </span>
                  </div>

                  <div className="recent-expense__amount">
                    <strong>{formatCurrency(Number(expense.amount))}</strong>
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
                <p>Your recently added expenses will appear here.</p>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}