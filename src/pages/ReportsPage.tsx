import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  PieChart as PieChartIcon,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  X,
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

type DateRangeOption =
  | "today"
  | "week"
  | "month"
  | "year"
  | "custom";

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

interface DateRange {
  start: Date;
  end: Date;
}

const DATE_RANGE_OPTIONS: Array<{
  value: Exclude<DateRangeOption, "custom">;
  label: string;
}> = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "week",
    label: "This Week",
  },
  {
    value: "month",
    label: "This Month",
  },
  {
    value: "year",
    label: "This Year",
  },
];

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

function getLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getValidExpenseDate(date: string): Date | null {
  const parsedDate = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function getStartOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function getEndOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function getDateRange(option: DateRangeOption): DateRange {
  const today = new Date();

  if (option === "today") {
    return {
      start: getStartOfDay(today),
      end: getEndOfDay(today),
    };
  }

  if (option === "week") {
    const dayOfWeek = today.getDay();

    const daysSinceMonday =
      dayOfWeek === 0
        ? 6
        : dayOfWeek - 1;

    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - daysSinceMonday,
    );

    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 6,
    );

    return {
      start: getStartOfDay(start),
      end: getEndOfDay(end),
    };
  }

  if (option === "year") {
    return {
      start: new Date(
        today.getFullYear(),
        0,
        1,
        0,
        0,
        0,
        0,
      ),
      end: new Date(
        today.getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999,
      ),
    };
  }

  return {
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
      0,
      0,
      0,
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  };
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

function formatDateRangeLabel(
  rangeOption: DateRangeOption,
  customStartDate: string,
  customEndDate: string,
): string {
  if (rangeOption === "today") {
    return "Today";
  }

  if (rangeOption === "week") {
    return "This Week";
  }

  if (rangeOption === "month") {
    return "This Month";
  }

  if (rangeOption === "year") {
    return "This Year";
  }

  const startDate = getValidExpenseDate(customStartDate);
  const endDate = getValidExpenseDate(customEndDate);

  if (!startDate || !endDate) {
    return "Custom Range";
  }

  const startLabel = startDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  const endLabel = endDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

export default function ReportsPage() {
  const {
    expenses,
    loading,
    error,
    refreshExpenses,
  } = useExpenses();

  const dateFilterRef = useRef<HTMLDivElement | null>(null);

  const initialMonthRange = getDateRange("month");

  const [selectedRange, setSelectedRange] =
    useState<DateRangeOption>("month");

  const [isDateMenuOpen, setIsDateMenuOpen] =
    useState(false);

  const [isCustomRangeOpen, setIsCustomRangeOpen] =
    useState(false);

  const [customStartDate, setCustomStartDate] =
    useState(
      getLocalDateInputValue(initialMonthRange.start),
    );

  const [customEndDate, setCustomEndDate] =
    useState(
      getLocalDateInputValue(initialMonthRange.end),
    );

  const [appliedCustomStartDate, setAppliedCustomStartDate] =
    useState(customStartDate);

  const [appliedCustomEndDate, setAppliedCustomEndDate] =
    useState(customEndDate);

  const [customDateError, setCustomDateError] =
    useState("");

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const clickedElement = event.target as Node;

      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(clickedElement)
      ) {
        setIsDateMenuOpen(false);
        setIsCustomRangeOpen(false);
        setCustomDateError("");
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDateMenuOpen(false);
        setIsCustomRangeOpen(false);
        setCustomDateError("");
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, []);

  const activeDateRange = useMemo<DateRange>(() => {
    if (selectedRange !== "custom") {
      return getDateRange(selectedRange);
    }

    const startDate =
      getValidExpenseDate(appliedCustomStartDate);

    const endDate =
      getValidExpenseDate(appliedCustomEndDate);

    if (!startDate || !endDate) {
      return getDateRange("month");
    }

    return {
      start: getStartOfDay(startDate),
      end: getEndOfDay(endDate),
    };
  }, [
    selectedRange,
    appliedCustomStartDate,
    appliedCustomEndDate,
  ]);

  const filteredExpenses = useMemo<Expense[]>(() => {
    return expenses.filter((expense) => {
      const expenseDate =
        getValidExpenseDate(expense.date);

      if (!expenseDate) {
        return false;
      }

      return (
        expenseDate >= activeDateRange.start &&
        expenseDate <= activeDateRange.end
      );
    });
  }, [expenses, activeDateRange]);

  const totalSpending = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0,
    );
  }, [filteredExpenses]);

  const averageExpense =
    filteredExpenses.length > 0
      ? totalSpending / filteredExpenses.length
      : 0;

  const largestExpense = useMemo<Expense | null>(() => {
    if (filteredExpenses.length === 0) {
      return null;
    }

    return filteredExpenses.reduce(
      (largest, expense) =>
        Number(expense.amount) >
        Number(largest.amount)
          ? expense
          : largest,
    );
  }, [filteredExpenses]);

  const categoryData = useMemo<CategoryChartItem[]>(() => {
    const categoryTotals = filteredExpenses.reduce<
      Record<
        string,
        {
          amount: number;
          transactions: number;
        }
      >
    >((totals, expense) => {
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
    }, {});

    return Object.entries(categoryTotals)
      .map(
        ([
          category,
          categoryInformation,
        ]): CategoryChartItem => ({
          category,
          amount: categoryInformation.amount,
          transactions:
            categoryInformation.transactions,
          percentage:
            totalSpending > 0
              ? (
                  categoryInformation.amount /
                  totalSpending
                ) * 100
              : 0,
        }),
      )
      .sort(
        (firstCategory, secondCategory) =>
          secondCategory.amount -
          firstCategory.amount,
      );
  }, [filteredExpenses, totalSpending]);

  const highestCategory =
    categoryData.length > 0
      ? categoryData[0]
      : null;

  const monthlyData = useMemo<MonthlyChartItem[]>(() => {
    const monthlyTotals = filteredExpenses.reduce<
      Record<
        string,
        {
          amount: number;
          transactions: number;
          date: Date;
        }
      >
    >((totals, expense) => {
      const expenseDate =
        getValidExpenseDate(expense.date);

      if (!expenseDate) {
        return totals;
      }

      const monthKey = getMonthKey(expenseDate);

      if (!totals[monthKey]) {
        totals[monthKey] = {
          amount: 0,
          transactions: 0,
          date: new Date(
            expenseDate.getFullYear(),
            expenseDate.getMonth(),
            1,
          ),
        };
      }

      totals[monthKey].amount +=
        Number(expense.amount);

      totals[monthKey].transactions += 1;

      return totals;
    }, {});

    return Object.entries(monthlyTotals)
      .sort(
        (
          [, firstMonth],
          [, secondMonth],
        ) =>
          firstMonth.date.getTime() -
          secondMonth.date.getTime(),
      )
      .map(
        ([
          monthKey,
          monthInformation,
        ]): MonthlyChartItem => ({
          monthKey,
          month: getMonthLabel(
            monthInformation.date,
          ),
          amount: monthInformation.amount,
          transactions:
            monthInformation.transactions,
        }),
      );
  }, [filteredExpenses]);

  const activeRangeLabel = formatDateRangeLabel(
    selectedRange,
    appliedCustomStartDate,
    appliedCustomEndDate,
  );

  function selectPresetRange(
    range: Exclude<DateRangeOption, "custom">,
  ) {
    setSelectedRange(range);
    setIsDateMenuOpen(false);
    setIsCustomRangeOpen(false);
    setCustomDateError("");
  }

  function openCustomRange() {
    setIsCustomRangeOpen(true);
    setCustomDateError("");
  }

  function applyCustomRange() {
    if (!customStartDate || !customEndDate) {
      setCustomDateError(
        "Please select both start and end dates.",
      );
      return;
    }

    const startDate =
      getValidExpenseDate(customStartDate);

    const endDate =
      getValidExpenseDate(customEndDate);

    if (!startDate || !endDate) {
      setCustomDateError(
        "Please select valid dates.",
      );
      return;
    }

    if (startDate > endDate) {
      setCustomDateError(
        "The start date cannot be after the end date.",
      );
      return;
    }

    setAppliedCustomStartDate(customStartDate);
    setAppliedCustomEndDate(customEndDate);
    setSelectedRange("custom");
    setCustomDateError("");
    setIsDateMenuOpen(false);
    setIsCustomRangeOpen(false);
  }

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
            Understand your spending patterns and
            category distribution for any selected
            period.
          </p>
        </div>

        <div
          className="reports-date-filter"
          ref={dateFilterRef}
        >
          <button
            className={`reports-page__period ${
              isDateMenuOpen
                ? "reports-page__period--open"
                : ""
            }`}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isDateMenuOpen}
            onClick={() => {
              setIsDateMenuOpen(
                (currentValue) => !currentValue,
              );

              if (isDateMenuOpen) {
                setIsCustomRangeOpen(false);
                setCustomDateError("");
              }
            }}
          >
            <CalendarDays size={18} />

            <span>{activeRangeLabel}</span>

            <ChevronDown
              className="reports-page__period-chevron"
              size={17}
            />
          </button>

          {isDateMenuOpen && (
            <div
              className="reports-date-menu"
              role="menu"
            >
              <div className="reports-date-menu__heading">
                <div>
                  <strong>Select date range</strong>
                  <span>
                    All reports update automatically
                  </span>
                </div>

                <button
                  type="button"
                  aria-label="Close date filter"
                  onClick={() => {
                    setIsDateMenuOpen(false);
                    setIsCustomRangeOpen(false);
                    setCustomDateError("");
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="reports-date-menu__options">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    className={`reports-date-option ${
                      selectedRange === option.value
                        ? "reports-date-option--active"
                        : ""
                    }`}
                    type="button"
                    role="menuitem"
                    key={option.value}
                    onClick={() =>
                      selectPresetRange(option.value)
                    }
                  >
                    <span>{option.label}</span>

                    {selectedRange === option.value && (
                      <Check size={17} />
                    )}
                  </button>
                ))}

                <button
                  className={`reports-date-option reports-date-option--custom ${
                    selectedRange === "custom"
                      ? "reports-date-option--active"
                      : ""
                  }`}
                  type="button"
                  role="menuitem"
                  onClick={openCustomRange}
                >
                  <span>Custom Date Range</span>

                  {selectedRange === "custom" ? (
                    <Check size={17} />
                  ) : (
                    <ChevronDown
                      className={
                        isCustomRangeOpen
                          ? "reports-date-option__chevron reports-date-option__chevron--open"
                          : "reports-date-option__chevron"
                      }
                      size={17}
                    />
                  )}
                </button>
              </div>

              {isCustomRangeOpen && (
                <div className="reports-custom-range">
                  <div className="reports-custom-range__fields">
                    <label>
                      <span>Start date</span>

                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(event) => {
                          setCustomStartDate(
                            event.target.value,
                          );

                          setCustomDateError("");
                        }}
                      />
                    </label>

                    <label>
                      <span>End date</span>

                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(event) => {
                          setCustomEndDate(
                            event.target.value,
                          );

                          setCustomDateError("");
                        }}
                      />
                    </label>
                  </div>

                  {customDateError && (
                    <p className="reports-custom-range__error">
                      {customDateError}
                    </p>
                  )}

                  <button
                    className="reports-custom-range__apply"
                    type="button"
                    onClick={applyCustomRange}
                  >
                    Apply Date Range
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {expenses.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty__icon">
            <BarChart3 size={32} />
          </div>

          <h2>No expense data available</h2>

          <p>
            Add expenses from the Expenses page. Your
            reports and charts will update automatically.
          </p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty__icon">
            <CalendarDays size={32} />
          </div>

          <h2>No expenses in this date range</h2>

          <p>
            Choose another period from the date filter to
            view your spending report.
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

                <strong>
                  {formatCurrency(totalSpending)}
                </strong>

                <small>{activeRangeLabel}</small>
              </div>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-card__icon">
                <ReceiptText size={23} />
              </div>

              <div>
                <span>Transactions</span>

                <strong>
                  {filteredExpenses.length}
                </strong>

                <small>
                  {filteredExpenses.length === 1
                    ? "Recorded expense"
                    : "Recorded expenses"}
                </small>
              </div>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-card__icon">
                <BarChart3 size={23} />
              </div>

              <div>
                <span>Average expense</span>

                <strong>
                  {formatCurrency(averageExpense)}
                </strong>

                <small>
                  Average amount per transaction
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
                  {highestCategory?.category ??
                    "No category"}
                </strong>

                <small>
                  {highestCategory
                    ? formatCurrency(
                        highestCategory.amount,
                      )
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

                  <p>
                    Spending totals within{" "}
                    {activeRangeLabel.toLowerCase()}
                  </p>
                </div>

                <div className="report-panel__badge">
                  <BarChart3 size={16} />
                  Monthly
                </div>
              </div>

              <div className="report-chart report-chart--bar">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
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
                        fill:
                          "rgba(229, 157, 44, 0.08)",
                      }}
                      formatter={(
                        value,
                      ): [string, string] => [
                        formatCurrency(
                          Number(value ?? 0),
                        ),
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

                  <p>
                    How spending is divided during the
                    selected period
                  </p>
                </div>

                <div className="report-panel__badge">
                  <PieChartIcon size={16} />
                  Categories
                </div>
              </div>

              <div className="report-chart report-chart--pie">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
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
                        (category, index) => (
                          <Cell
                            key={category.category}
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(
                        value,
                      ): [string, string] => [
                        formatCurrency(
                          Number(value ?? 0),
                        ),
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
                  Ranked by total amount spent in each
                  category
                </p>
              </div>
            </div>

            <div className="category-breakdown">
              {categoryData.map(
                (category, index) => (
                  <div
                    className="category-breakdown__row"
                    key={category.category}
                  >
                    <div
                      className="category-breakdown__marker"
                      style={{
                        backgroundColor:
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ],
                      }}
                    />

                    <div className="category-breakdown__details">
                      <div className="category-breakdown__heading">
                        <strong>
                          {category.category}
                        </strong>

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
                                index %
                                  CHART_COLORS.length
                              ],
                          }}
                        />
                      </div>
                    </div>

                    <div className="category-breakdown__value">
                      <strong>
                        {formatCurrency(
                          category.amount,
                        )}
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

          <article className="report-panel report-largest-expense">
            <div className="report-panel__header">
              <div>
                <h2>Largest expense</h2>

                <p>
                  Your highest individual transaction in
                  the selected period
                </p>
              </div>
            </div>

            <div className="report-largest-expense__content">
              <div className="report-largest-expense__icon">
                <TrendingUp size={24} />
              </div>

              <div className="report-largest-expense__details">
                <strong>
                  {largestExpense?.title ??
                    "No expense"}
                </strong>

                <span>
                  {largestExpense?.category ??
                    "No category"}
                  {largestExpense?.payment_method
                    ? ` • ${largestExpense.payment_method}`
                    : ""}
                </span>
              </div>

              <strong className="report-largest-expense__amount">
                {formatCurrency(
                  Number(largestExpense?.amount ?? 0),
                )}
              </strong>
            </div>
          </article>
        </>
      )}
    </section>
  );
}