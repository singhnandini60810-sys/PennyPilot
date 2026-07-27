import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { useExpenses } from '../../hooks/useExpenses'
import { useAuth } from '../../hooks/useAuth'

function Header() {
  const currentDate = format(new Date(), 'EEEE, dd MMMM yyyy')

  const { loading, error } = useExpenses()
  const { logout, user } = useAuth()

  const connectionLabel = loading
    ? 'Connecting'
    : error
      ? 'API unavailable'
      : 'Connected'

  return (
    <header className="topbar">
      <div className="topbar__date">
        <CalendarDays size={18} />
        <span>{currentDate}</span>
      </div>

      <div className="topbar__status">
        <span>{user?.name || user?.email}</span>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <div
        className={`topbar__status ${
          error ? 'topbar__status--error' : ''
        }`}
      >
        <span className="topbar__status-dot" />
        <span>{connectionLabel}</span>
      </div>
    </header>
  )
}

export default Header