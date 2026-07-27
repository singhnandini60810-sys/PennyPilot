import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { useExpenses } from '../../hooks/useExpenses'
import { useAuth } from '../../hooks/useAuth'

function Header() {
  const today = new Date()

  const weekday = format(today, 'EEEE')
  const fullDate = format(today, 'dd MMMM yyyy')

  const { loading, error } = useExpenses()
  const { logout, user } = useAuth()

  const connectionLabel = loading
    ? 'Connecting'
    : error
      ? 'API unavailable'
      : 'Connected'

  return (
    <header className="topbar">
      {/* LEFT */}

      <div className="topbar__date">
        <CalendarDays size={20} />

        <div className="topbar__date-content">
          <h3>{weekday}</h3>
          <span>{fullDate}</span>
        </div>
      </div>

      {/* RIGHT */}

      <div className="topbar__profile">

        <div className="topbar__user">

          <span className="topbar__username">
            {user?.name || 'User'}
          </span>

          <span className="topbar__email">
            {user?.email}
          </span>

        </div>

        <div className="topbar__actions">

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

          <div
            className={`topbar__connection ${
              error ? 'topbar__connection--error' : ''
            }`}
          >
            <span className="topbar__status-dot" />
            {connectionLabel}
          </div>

        </div>

      </div>
    </header>
  )
}

export default Header