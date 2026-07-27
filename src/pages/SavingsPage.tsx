import { useMemo, useState, type FormEvent } from 'react'
import {
  CircleDollarSign,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react'

interface SavingGoal {
  id: string
  title: string
  targetAmount: number
  savedAmount: number
}

function SavingsPage() {
  const [goals, setGoals] = useState<SavingGoal[]>([
    {
      id: '1',
      title: 'Emergency Fund',
      targetAmount: 50000,
      savedAmount: 18000,
    },
    {
      id: '2',
      title: 'New Laptop',
      targetAmount: 80000,
      savedAmount: 25000,
    },
  ])

  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [savedAmount, setSavedAmount] = useState('')
  const [showForm, setShowForm] = useState(false)

  const totalTarget = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
    [goals],
  )

  const totalSaved = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.savedAmount, 0),
    [goals],
  )

  const overallProgress =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedTarget = Number(targetAmount)
    const parsedSaved = Number(savedAmount || 0)

    if (!title.trim() || parsedTarget <= 0 || parsedSaved < 0) {
      return
    }

    const newGoal: SavingGoal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      targetAmount: parsedTarget,
      savedAmount: Math.min(parsedSaved, parsedTarget),
    }

    setGoals((currentGoals) => [newGoal, ...currentGoals])
    setTitle('')
    setTargetAmount('')
    setSavedAmount('')
    setShowForm(false)
  }

  function deleteGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId),
    )
  }

  return (
    <section className="savings-page">
      <div className="savings-page__header">
        <div>
          <p className="savings-page__eyebrow">
            Financial planning
          </p>

          <h1>Savings Goals</h1>

          <p>
            Create savings purposes and track how close you are to
            reaching each target.
          </p>
        </div>

        <button
          className="savings-add-button"
          type="button"
          onClick={() => setShowForm((current) => !current)}
        >
          <Plus size={18} />
          New savings goal
        </button>
      </div>

      <div className="savings-summary">
        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <Target size={22} />
          </div>

          <div>
            <span>Total target</span>
            <strong>₹{totalTarget.toLocaleString('en-IN')}</strong>
          </div>
        </article>

        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <CircleDollarSign size={22} />
          </div>

          <div>
            <span>Total saved</span>
            <strong>₹{totalSaved.toLocaleString('en-IN')}</strong>
          </div>
        </article>

        <article className="savings-summary-card">
          <div className="savings-summary-card__icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Overall progress</span>
            <strong>{overallProgress.toFixed(0)}%</strong>
          </div>
        </article>
      </div>

      {showForm && (
        <form className="savings-form" onSubmit={handleSubmit}>
          <div className="savings-form__heading">
            <div>
              <h2>Create a savings goal</h2>
              <p>Add the purpose, target and current amount.</p>
            </div>

            <button
              type="button"
              className="savings-form__close"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>

          <div className="savings-form__grid">
            <label>
              Goal name
              <input
                type="text"
                value={title}
                placeholder="Example: New phone"
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label>
              Target amount
              <input
                type="number"
                min="1"
                value={targetAmount}
                placeholder="50000"
                onChange={(event) =>
                  setTargetAmount(event.target.value)
                }
              />
            </label>

            <label>
              Amount already saved
              <input
                type="number"
                min="0"
                value={savedAmount}
                placeholder="0"
                onChange={(event) =>
                  setSavedAmount(event.target.value)
                }
              />
            </label>
          </div>

          <button className="savings-form__submit" type="submit">
            Save goal
          </button>
        </form>
      )}

      <div className="savings-goals">
        {goals.length === 0 ? (
          <div className="savings-empty">
            <Target size={34} />
            <h2>No savings goals yet</h2>
            <p>Create your first goal to start tracking progress.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min(
                    (goal.savedAmount / goal.targetAmount) * 100,
                    100,
                  )
                : 0

            return (
              <article className="saving-goal-card" key={goal.id}>
                <div className="saving-goal-card__top">
                  <div>
                    <span className="saving-goal-card__label">
                      Savings purpose
                    </span>
                    <h2>{goal.title}</h2>
                  </div>

                  <button
                    type="button"
                    className="saving-goal-card__delete"
                    aria-label={`Delete ${goal.title}`}
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="saving-goal-card__amounts">
                  <div>
                    <span>Saved</span>
                    <strong>
                      ₹{goal.savedAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div>
                    <span>Target</span>
                    <strong>
                      ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="saving-goal-card__progress-heading">
                  <span>Progress</span>
                  <strong>{progress.toFixed(0)}%</strong>
                </div>

                <div className="saving-goal-card__progress">
                  <div
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="saving-goal-card__remaining">
                  ₹
                  {Math.max(
                    goal.targetAmount - goal.savedAmount,
                    0,
                  ).toLocaleString('en-IN')}{' '}
                  remaining
                </p>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

export default SavingsPage