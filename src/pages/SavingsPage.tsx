import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import "../styles/savings.css";

interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  notes: string;
  createdAt: string;
}

interface GoalFormData {
  title: string;
  targetAmount: string;
  savedAmount: string;
  targetDate: string;
  notes: string;
}

interface GoalChartItem {
  id: string;
  name: string;
  savedAmount: number;
}

const SAVINGS_STORAGE_KEY = "pennypilot-savings-goals";

const EMPTY_FORM: GoalFormData = {
  title: "",
  targetAmount: "",
  savedAmount: "",
  targetDate: "",
  notes: "",
};

const CHART_COLORS = [
  "#E59D2C",
  "#2E4365",
  "#8A3B08",
  "#F3D58D",
  "#7489A8",
  "#B5672A",
  "#D5B261",
  "#526A90",
];

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getGoalProgress(goal: SavingGoal): number {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  return Math.min(
    (goal.savedAmount / goal.targetAmount) * 100,
    100,
  );
}

function getRemainingAmount(goal: SavingGoal): number {
  return Math.max(
    goal.targetAmount - goal.savedAmount,
    0,
  );
}

function getTargetDateLabel(targetDate: string): string {
  if (!targetDate) {
    return "No target date";
  }

  const parsedDate = new Date(`${targetDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No target date";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function loadStoredGoals(): SavingGoal[] {
  try {
    const storedGoals = localStorage.getItem(
      SAVINGS_STORAGE_KEY,
    );

    if (!storedGoals) {
      return [];
    }

    const parsedGoals = JSON.parse(storedGoals);

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

function SavingsPage() {
  const [goals, setGoals] =
    useState<SavingGoal[]>(loadStoredGoals);

  const [isGoalModalOpen, setIsGoalModalOpen] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<SavingGoal | null>(null);

  const [addingMoneyGoal, setAddingMoneyGoal] =
    useState<SavingGoal | null>(null);

  const [deletingGoal, setDeletingGoal] =
    useState<SavingGoal | null>(null);

  const [goalForm, setGoalForm] =
    useState<GoalFormData>(EMPTY_FORM);

  const [addMoneyAmount, setAddMoneyAmount] =
    useState("");

  const [formError, setFormError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      SAVINGS_STORAGE_KEY,
      JSON.stringify(goals),
    );
  }, [goals]);

  const totalTarget = useMemo(
    () =>
      goals.reduce(
        (sum, goal) => sum + goal.targetAmount,
        0,
      ),
    [goals],
  );

  const totalSaved = useMemo(
    () =>
      goals.reduce(
        (sum, goal) => sum + goal.savedAmount,
        0,
      ),
    [goals],
  );

  const totalRemaining = Math.max(
    totalTarget - totalSaved,
    0,
  );

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          (totalSaved / totalTarget) * 100,
          100,
        )
      : 0;

  const completedGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.savedAmount >= goal.targetAmount,
      ).length,
    [goals],
  );

  const chartData = useMemo<GoalChartItem[]>(
    () =>
      goals
        .filter((goal) => goal.savedAmount > 0)
        .map((goal) => ({
          id: goal.id,
          name: goal.title,
          savedAmount: goal.savedAmount,
        })),
    [goals],
  );

  function updateGoalForm(
    field: keyof GoalFormData,
    value: string,
  ) {
    setGoalForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setFormError("");
  }

  function openCreateGoalModal() {
    setEditingGoal(null);
    setGoalForm(EMPTY_FORM);
    setFormError("");
    setIsGoalModalOpen(true);
  }

  function openEditGoalModal(goal: SavingGoal) {
    setEditingGoal(goal);

    setGoalForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
      targetDate: goal.targetDate,
      notes: goal.notes,
    });

    setFormError("");
    setIsGoalModalOpen(true);
  }

  function closeGoalModal() {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
    setGoalForm(EMPTY_FORM);
    setFormError("");
  }

  function handleGoalSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedTarget = Number(
      goalForm.targetAmount,
    );

    const parsedSaved = Number(
      goalForm.savedAmount || 0,
    );

    if (!goalForm.title.trim()) {
      setFormError("Please enter a goal name.");
      return;
    }

    if (
      !Number.isFinite(parsedTarget) ||
      parsedTarget <= 0
    ) {
      setFormError(
        "Please enter a target amount greater than zero.",
      );
      return;
    }

    if (
      !Number.isFinite(parsedSaved) ||
      parsedSaved < 0
    ) {
      setFormError(
        "Saved amount cannot be negative.",
      );
      return;
    }

    const safeSavedAmount = Math.min(
      parsedSaved,
      parsedTarget,
    );

    if (editingGoal) {
      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === editingGoal.id
            ? {
                ...goal,
                title: goalForm.title.trim(),
                targetAmount: parsedTarget,
                savedAmount: safeSavedAmount,
                targetDate: goalForm.targetDate,
                notes: goalForm.notes.trim(),
              }
            : goal,
        ),
      );
    } else {
      const newGoal: SavingGoal = {
        id: crypto.randomUUID(),
        title: goalForm.title.trim(),
        targetAmount: parsedTarget,
        savedAmount: safeSavedAmount,
        targetDate: goalForm.targetDate,
        notes: goalForm.notes.trim(),
        createdAt: new Date().toISOString(),
      };

      setGoals((currentGoals) => [
        newGoal,
        ...currentGoals,
      ]);
    }

    closeGoalModal();
  }

  function openAddMoneyModal(goal: SavingGoal) {
    setAddingMoneyGoal(goal);
    setAddMoneyAmount("");
    setFormError("");
  }

  function closeAddMoneyModal() {
    setAddingMoneyGoal(null);
    setAddMoneyAmount("");
    setFormError("");
  }

  function handleAddMoney(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!addingMoneyGoal) {
      return;
    }

    const parsedAmount = Number(addMoneyAmount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setFormError(
        "Please enter an amount greater than zero.",
      );
      return;
    }

    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== addingMoneyGoal.id) {
          return goal;
        }

        return {
          ...goal,
          savedAmount: Math.min(
            goal.savedAmount + parsedAmount,
            goal.targetAmount,
          ),
        };
      }),
    );

    closeAddMoneyModal();
  }

  function confirmDeleteGoal() {
    if (!deletingGoal) {
      return;
    }

    setGoals((currentGoals) =>
      currentGoals.filter(
        (goal) => goal.id !== deletingGoal.id,
      ),
    );

    setDeletingGoal(null);
  }

  return (
    <section className="savings-page">
      <header className="savings-page__header">
        <div>
          <span className="savings-page__eyebrow">
            Financial planning
          </span>

          <h1>Savings Goals</h1>

          <p>
            Create financial goals, add savings and track
            your progress toward every target.
          </p>
        </div>

        <button
          className="savings-primary-button"
          type="button"
          onClick={openCreateGoalModal}
        >
          <Plus size={18} />
          New savings goal
        </button>
      </header>

      <div className="savings-summary-grid">
        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <CircleDollarSign size={23} />
          </div>

          <div>
            <span>Total saved</span>
            <strong>{formatAmount(totalSaved)}</strong>
            <small>Across all savings goals</small>
          </div>
        </article>

        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <Target size={23} />
          </div>

          <div>
            <span>Total target</span>
            <strong>{formatAmount(totalTarget)}</strong>
            <small>Combined target amount</small>
          </div>
        </article>

        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <TrendingUp size={23} />
          </div>

          <div>
            <span>Remaining</span>
            <strong>
              {formatAmount(totalRemaining)}
            </strong>
            <small>
              {overallProgress.toFixed(0)}% completed
            </small>
          </div>
        </article>

        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <span>Total goals</span>
            <strong>{goals.length}</strong>
            <small>
              {completedGoals} completed
            </small>
          </div>
        </article>
      </div>

      {goals.length > 0 && (
        <div className="savings-overview-grid">
          <article className="savings-panel savings-progress-panel">
            <div className="savings-panel__header">
              <div>
                <h2>Overall savings progress</h2>
                <p>
                  Combined progress across all your
                  financial goals.
                </p>
              </div>

              <div className="savings-panel__badge">
                <TrendingUp size={16} />
                {overallProgress.toFixed(0)}%
              </div>
            </div>

            <div className="savings-overall-progress">
              <div className="savings-overall-progress__top">
                <div>
                  <span>Saved</span>
                  <strong>
                    {formatAmount(totalSaved)}
                  </strong>
                </div>

                <div>
                  <span>Target</span>
                  <strong>
                    {formatAmount(totalTarget)}
                  </strong>
                </div>
              </div>

              <div className="savings-overall-progress__track">
                <div
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>

              <div className="savings-overall-progress__footer">
                <span>
                  {overallProgress.toFixed(1)}% complete
                </span>

                <span>
                  {formatAmount(totalRemaining)} remaining
                </span>
              </div>
            </div>
          </article>

          <article className="savings-panel savings-chart-panel">
            <div className="savings-panel__header">
              <div>
                <h2>Saved amount distribution</h2>
                <p>
                  How your current savings are divided.
                </p>
              </div>

              <div className="savings-panel__badge">
                <PiggyBank size={16} />
                Goals
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="savings-chart-empty">
                <PiggyBank size={30} />

                <p>
                  Add money to a goal to display the
                  savings chart.
                </p>
              </div>
            ) : (
              <div className="savings-chart">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="savedAmount"
                      nameKey="name"
                      cx="50%"
                      cy="44%"
                      innerRadius={58}
                      outerRadius={91}
                      paddingAngle={3}
                    >
                      {chartData.map((goal, index) => (
                        <Cell
                          key={goal.id}
                          fill={
                            CHART_COLORS[
                              index %
                                CHART_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(
                        value,
                      ): [string, string] => [
                        formatAmount(
                          Number(value ?? 0),
                        ),
                        "Saved",
                      ]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="savings-chart__centre">
                  <strong>
                    {formatAmount(totalSaved)}
                  </strong>
                  <span>Total saved</span>
                </div>
              </div>
            )}
          </article>
        </div>
      )}

      <section className="savings-goals-section">
        {goals.length > 0 && (
          <div className="savings-goals-section__header">
            <div>
              <h2>Your savings goals</h2>
              <p>
                Add money or update goal details as your
                plans change.
              </p>
            </div>

            <span>
              {goals.length}{" "}
              {goals.length === 1 ? "goal" : "goals"}
            </span>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="savings-empty">
            <div className="savings-empty__icon">
              <Target size={34} />
            </div>

            <h2>No savings goals yet</h2>

            <p>
              Create your first savings goal and begin
              tracking your financial progress.
            </p>

            <button
              className="savings-primary-button"
              type="button"
              onClick={openCreateGoalModal}
            >
              <Plus size={18} />
              Create your first goal
            </button>
          </div>
        ) : (
          <div className="savings-goals-grid">
            {goals.map((goal) => {
              const progress = getGoalProgress(goal);
              const remaining =
                getRemainingAmount(goal);

              const isCompleted =
                goal.savedAmount >= goal.targetAmount;

              return (
                <article
                  className={`saving-goal-card ${
                    isCompleted
                      ? "saving-goal-card--completed"
                      : ""
                  }`}
                  key={goal.id}
                >
                  <div className="saving-goal-card__header">
                    <div className="saving-goal-card__title">
                      <div className="saving-goal-card__icon">
                        {isCompleted ? (
                          <CheckCircle2 size={23} />
                        ) : (
                          <Target size={23} />
                        )}
                      </div>

                      <div>
                        <span>
                          {isCompleted
                            ? "Goal completed"
                            : "Savings goal"}
                        </span>

                        <h3>{goal.title}</h3>
                      </div>
                    </div>

                    <div className="saving-goal-card__actions">
                      <button
                        type="button"
                        aria-label={`Edit ${goal.title}`}
                        onClick={() =>
                          openEditGoalModal(goal)
                        }
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        className="saving-goal-card__delete"
                        type="button"
                        aria-label={`Delete ${goal.title}`}
                        onClick={() =>
                          setDeletingGoal(goal)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="saving-goal-card__notes">
                      {goal.notes}
                    </p>
                  )}

                  <div className="saving-goal-card__amounts">
                    <div>
                      <span>Saved amount</span>

                      <strong>
                        {formatAmount(goal.savedAmount)}
                      </strong>
                    </div>

                    <div>
                      <span>Target amount</span>

                      <strong>
                        {formatAmount(
                          goal.targetAmount,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="saving-goal-card__progress-heading">
                    <span>Progress</span>
                    <strong>
                      {progress.toFixed(0)}%
                    </strong>
                  </div>

                  <div className="saving-goal-card__progress">
                    <div
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="saving-goal-card__details">
                    <div>
                      <CalendarDays size={15} />

                      <span>
                        {getTargetDateLabel(
                          goal.targetDate,
                        )}
                      </span>
                    </div>

                    <span>
                      {isCompleted
                        ? "Target reached"
                        : `${formatAmount(
                            remaining,
                          )} remaining`}
                    </span>
                  </div>

                  <div className="saving-goal-card__footer">
                    <button
                      className="saving-goal-card__add-money"
                      type="button"
                      disabled={isCompleted}
                      onClick={() =>
                        openAddMoneyModal(goal)
                      }
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={17} />
                          Goal completed
                        </>
                      ) : (
                        <>
                          <Plus size={17} />
                          Add money
                        </>
                      )}
                    </button>

                    <button
                      className="saving-goal-card__edit"
                      type="button"
                      onClick={() =>
                        openEditGoalModal(goal)
                      }
                    >
                      Edit details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isGoalModalOpen && (
        <div
          className="savings-modal-backdrop"
          onMouseDown={closeGoalModal}
        >
          <div
            className="savings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="savings-goal-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="savings-modal__header">
              <div>
                <h2 id="savings-goal-modal-title">
                  {editingGoal
                    ? "Edit savings goal"
                    : "Create savings goal"}
                </h2>

                <p>
                  {editingGoal
                    ? "Update your goal details and current savings."
                    : "Add a new financial target to PennyPilot."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close goal form"
                onClick={closeGoalModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="savings-form"
              onSubmit={handleGoalSubmit}
            >
              <label>
                <span>Goal name</span>

                <input
                  type="text"
                  maxLength={100}
                  value={goalForm.title}
                  placeholder="Example: New laptop"
                  onChange={(event) =>
                    updateGoalForm(
                      "title",
                      event.target.value,
                    )
                  }
                />
              </label>

              <div className="savings-form__row">
                <label>
                  <span>Target amount</span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={goalForm.targetAmount}
                    placeholder="50000"
                    onChange={(event) =>
                      updateGoalForm(
                        "targetAmount",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Initial saved amount
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goalForm.savedAmount}
                    placeholder="0"
                    onChange={(event) =>
                      updateGoalForm(
                        "savedAmount",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <label>
                <span>Target date</span>

                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(event) =>
                    updateGoalForm(
                      "targetDate",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Notes</span>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={goalForm.notes}
                  placeholder="Optional notes about this savings goal"
                  onChange={(event) =>
                    updateGoalForm(
                      "notes",
                      event.target.value,
                    )
                  }
                />
              </label>

              {formError && (
                <p className="savings-form__error">
                  {formError}
                </p>
              )}

              <div className="savings-form__actions">
                <button
                  className="savings-secondary-button"
                  type="button"
                  onClick={closeGoalModal}
                >
                  Cancel
                </button>

                <button
                  className="savings-primary-button"
                  type="submit"
                >
                  {editingGoal
                    ? "Save changes"
                    : "Create goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addingMoneyGoal && (
        <div
          className="savings-modal-backdrop"
          onMouseDown={closeAddMoneyModal}
        >
          <div
            className="savings-modal savings-modal--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-money-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="savings-modal__header">
              <div>
                <h2 id="add-money-modal-title">
                  Add money
                </h2>

                <p>
                  Add savings to{" "}
                  <strong>
                    {addingMoneyGoal.title}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                aria-label="Close add money form"
                onClick={closeAddMoneyModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="add-money-summary">
              <div>
                <span>Currently saved</span>
                <strong>
                  {formatAmount(
                    addingMoneyGoal.savedAmount,
                  )}
                </strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>
                  {formatAmount(
                    getRemainingAmount(
                      addingMoneyGoal,
                    ),
                  )}
                </strong>
              </div>
            </div>

            <form
              className="savings-form"
              onSubmit={handleAddMoney}
            >
              <label>
                <span>Amount to add</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  autoFocus
                  value={addMoneyAmount}
                  placeholder="Example: 2000"
                  onChange={(event) => {
                    setAddMoneyAmount(
                      event.target.value,
                    );

                    setFormError("");
                  }}
                />
              </label>

              {formError && (
                <p className="savings-form__error">
                  {formError}
                </p>
              )}

              <div className="savings-form__actions">
                <button
                  className="savings-secondary-button"
                  type="button"
                  onClick={closeAddMoneyModal}
                >
                  Cancel
                </button>

                <button
                  className="savings-primary-button"
                  type="submit"
                >
                  Add money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingGoal && (
        <div
          className="savings-modal-backdrop"
          onMouseDown={() =>
            setDeletingGoal(null)
          }
        >
          <div
            className="savings-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-goal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="savings-delete-dialog__icon">
              <Trash2 size={25} />
            </div>

            <h2 id="delete-goal-title">
              Delete savings goal?
            </h2>

            <p>
              This will permanently remove{" "}
              <strong>{deletingGoal.title}</strong>{" "}
              and its saved progress.
            </p>

            <div className="savings-form__actions">
              <button
                className="savings-secondary-button"
                type="button"
                onClick={() =>
                  setDeletingGoal(null)
                }
              >
                Cancel
              </button>

              <button
                className="savings-danger-button"
                type="button"
                onClick={confirmDeleteGoal}
              >
                Delete goal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SavingsPage;