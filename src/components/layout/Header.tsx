import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

function Header() {
  const currentDate = format(new Date(), 'EEEE, dd MMMM yyyy')

  return (
    <header className="topbar">
      <div className="topbar__date">
        <CalendarDays size={18} />
        <span>{currentDate}</span>
      </div>

      <div className="topbar__status">
        <span className="topbar__status-dot" />
        <span>Connected</span>
      </div>
    </header>
  )
}

export default Header