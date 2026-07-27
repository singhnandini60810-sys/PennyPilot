import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  PieChart as PieChartIcon,
  ReceiptText,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useExpenses } from "../hooks/useExpenses";
import type { Expense } from "../types/expense";
import { formatCurrency } from "../utils/formatCurrency";

import "../styles/reports.css";

interface MonthlyChartItem {
  monthKey: string;
  month: string;
  amount: number;
  transactions: number;
}

interface CategoryChartItem {
  category: string;
  amount: number;
  transactions: number;
  percentage: number;
}

const CHART_COLORS: string[] = [
  "#E59D2C",
  "#2E4365",
  "#8A3B08",
  "#F3D58D",
  "#7489A8",
  "#B5672A",
  "#D5B261",
  "#526A90",
];

function getValidExpenseDate(date: string): Date | null {
  const parsedDate = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function getLastSixMonths(): Array<{
  key: string;
  label: string;
}> {
  const months: Array<{
    key: string;
    label: string;
  }> = [];

  const currentDate = new Date();

  for (let monthOffset = 5; monthOffset >= 0; monthOffset -= 1) {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - monthOffset,
      1,
    );

    months.push({
      key: getMonthKey(monthDate),
      label: getMonthLabel(monthDate),
    });
  }

  return months;
}

export default function ReportsPage() {
  const { expenses, loading, error, refreshExpenses } = useExpenses();

  const typedExpenses: Expense[] = expenses;

  const totalSpending = typedExpenses.reduce(
    (total: number, expense: Expense): number =>
      total + Number(expense.amount),
    0,
  );

  const averageExpense =
    typedExpenses.length > 0
      ? totalSpending / typedExpenses.length
      : 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthSpending = typedExpenses.reduce(
    (total: number, expense: Expense): number => {
      const expenseDate = getValidExpenseDate(expense.date);

      if (
        expenseDate &&
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      ) {
        return total + Number(expense.amount);
      }

      return total;
    },
    0,
  );

  const categoryTotals = typedExpenses.reduce<
    Record<
      string,
      {
        amount: number;
        transactions: number;
      }
    >
  >(
    (
      totals: Record<
        string,
        {
          amount: number;
          transactions: number;
        }
      >,
      expense: Expense,
    ) => {
      const category = expense.category || "Other";

      if (!totals[category]) {
        totals[category] = {
          amount: 0,
          transactions: 0,
        };
      }

      totals[category].amount += Number(expense.amount);
      totals[category].transactions += 1;

      return totals;
    },
    {},
  );

  const categoryData: CategoryChartItem[] = Object.entries(categoryTotals)
    .map(
      ([
        category,
        categoryInformation,
      ]: [
        string,
        {
          amount: number;
          transactions: number;
        },
      ]): CategoryChartItem => ({
        category,
        amount: categoryInformation.amount,
        transactions: categoryInformation.transactions,
        percentage:
          totalSpending > 0
            ? (categoryInformation.amount / totalSpending) * 100
            : 0,
      }),
    )
    .sort(
      (
        firstCategory: CategoryChartItem,
        secondCategory: CategoryChartItem,
      ): number => secondCategory.amount - firstCategory.amount,
    );

  const highestCategory: CategoryChartItem | null =
    categoryData.length > 0 ? categoryData[0] : null;

  const monthlyTotals = typedExpenses.reduce<
    Record<
      string,
      {
        amount: number;
        transactions: number;
      }
    >
  >(
    (
      totals: Record<
        string,
        {
          amount: number;
          transactions: number;
        }
      >,
      expense: Expense,
    ) => {
      const expenseDate = getValidExpenseDate(expense.date);

      if (!expenseDate) {
        return totals;
      }

      const monthKey = getMonthKey(expenseDate);

      if (!totals[monthKey]) {
        totals[monthKey] = {
          amount: 0,
          transactions: 0,
        };
      }

      totals[monthKey].amount += Number(expense.amount);
      totals[monthKey].transactions += 1;

      return totals;
    },
    {},
  );

  const monthlyData: MonthlyChartItem[] = getLastSixMonths().map(
    ({
      key,
      label,
    }: {
      key: string;
      label: string;
    }): MonthlyChartItem => ({
      monthKey: key,
      month: label,
      amount: monthlyTotals[key]?.amount ?? 0,
      transactions: monthlyTotals[key]?.transactions ?? 0,
    }),
  );

  if (loading) {
    return (
      <section className="reports-page">
        <div className="reports-state">
          <div className="reports-loader" />

          <div>
            <h2>Preparing your reports</h2>
            <p>Analysing your recorded expenses...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="reports-page">
        <div className="reports-state reports-state--error">
          <CircleDollarSign size={34} />

          <div>
            <h2>Unable to load reports</h2>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void refreshExpenses()}
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="reports-page">
      <header className="reports-page__header">
        <div>
          <span className="reports-page__eyebrow">
            Spending analytics
          </span>

          <h1>Reports</h1>

          <p>
            Understand your monthly spending patterns and category
            distribution.
          </p>
        </div>

        <div className="reports-page__period">
          <CalendarDays size={18} />
          Last six months
        </div>
      </header>

      {typedExpenses.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty__icon">
            <BarChart3 size={32} />
          </div>

          <h2>No expense data available</h2>

          <p>
            Add expenses from the Expenses page. Your reports and charts
            will update automatically.
          </p>
        </div>
      ) : (
        <>
          <div className="reports-summary-grid">
            <article className="report-summary-card">
              <div className="report-summary-card__icon">
                <CircleDollarSign size={23} />
              </div>

              <div>
                <span>Total spending</span>
                <strong>{formatCurrency(totalSpending)}</strong>
                <small>Across all recorded expenses</small>
              </div>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-card__icon">
                <CalendarDays size={23} />
              </div>

              <div>
                <span>This month</span>
                <strong>{formatCurrency(currentMonthSpending)}</strong>
                <small>
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </small>
              </div>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-card__icon">
                <ReceiptText size={23} />
              </div>

              <div>
                <span>Average expense</span>
                <strong>{formatCurrency(averageExpense)}</strong>
                <small>
                  Based on {typedExpenses.length}{" "}
                  {typedExpenses.length === 1
                    ? "transaction"
                    : "transactions"}
                </small>
              </div>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-card__icon">
                <TrendingUp size={23} />
              </div>

              <div>
                <span>Top category</span>
                <strong>
                  {highestCategory?.category ?? "No category"}
                </strong>

                <small>
                  {highestCategory
                    ? formatCurrency(highestCategory.amount)
                    : formatCurrency(0)}
                </small>
              </div>
            </article>
          </div>

          <div className="reports-chart-grid">
            <article className="report-panel report-panel--wide">
              <div className="report-panel__header">
                <div>
                  <h2>Monthly spending</h2>
                  <p>Expense totals during the last six months</p>
                </div>

                <div className="report-panel__badge">
                  <BarChart3 size={16} />
                  Monthly
                </div>
              </div>

              <div className="report-chart report-chart--bar">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 10,
                      right: 10,
                      bottom: 0,
                      left: 0,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      stroke="rgba(46, 67, 101, 0.12)"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#6f7785",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={72}
                      tick={{
                        fill: "#6f7785",
                        fontSize: 12,
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
    fill: "rgba(229, 157, 44, 0.08)",
  }}
  formatter={(value): [string, string] => [
    formatCurrency(Number(value ?? 0)),
    "Spending",
  ]}
/>

                    <Bar
                      dataKey="amount"
                      fill="#E59D2C"
                      radius={[9, 9, 3, 3]}
                      maxBarSize={54}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="report-panel">
              <div className="report-panel__header">
                <div>
                  <h2>Category distribution</h2>
                  <p>How your total spending is divided</p>
                </div>

                <div className="report-panel__badge">
                  <PieChartIcon size={16} />
                  Categories
                </div>
              </div>

              <div className="report-chart report-chart--pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="45%"
                      innerRadius={66}
                      outerRadius={102}
                      paddingAngle={3}
                    >
                      {categoryData.map(
                        (
                          category: CategoryChartItem,
                          index: number,
                        ) => (
                          <Cell
                            key={category.category}
                            fill={
                              CHART_COLORS[
                                index % CHART_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value): [string, string] => [
  formatCurrency(Number(value ?? 0)),
  "Spending",
]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={9}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="report-chart__centre">
                  <strong>
                    {formatCurrency(totalSpending)}
                  </strong>
                  <span>Total</span>
                </div>
              </div>
            </article>
          </div>

          <article className="report-panel">
            <div className="report-panel__header">
              <div>
                <h2>Category breakdown</h2>
                <p>
                  Ranked by total amount spent in each category
                </p>
              </div>
            </div>

            <div className="category-breakdown">
              {categoryData.map(
                (
                  category: CategoryChartItem,
                  index: number,
                ) => (
                  <div
                    className="category-breakdown__row"
                    key={category.category}
                  >
                    <div
                      className="category-breakdown__marker"
                      style={{
                        backgroundColor:
                          CHART_COLORS[
                            index % CHART_COLORS.length
                          ],
                      }}
                    />

                    <div className="category-breakdown__details">
                      <div className="category-breakdown__heading">
                        <strong>{category.category}</strong>

                        <span>
                          {category.transactions}{" "}
                          {category.transactions === 1
                            ? "expense"
                            : "expenses"}
                        </span>
                      </div>

                      <div className="category-breakdown__progress">
                        <span
                          style={{
                            width: `${Math.max(
                              category.percentage,
                              2,
                            )}%`,
                            backgroundColor:
                              CHART_COLORS[
                                index % CHART_COLORS.length
                              ],
                          }}
                        />
                      </div>
                    </div>

                    <div className="category-breakdown__value">
                      <strong>
                        {formatCurrency(category.amount)}
                      </strong>

                      <span>
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </article>
        </>
      )}
    </section>
  );
}