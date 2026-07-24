import { NavLink } from 'react-router-dom'
import { WalletCards } from 'lucide-react'
import { navigationItems } from '../../config/navigation'
import './layout.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <WalletCards size={24} strokeWidth={2.2} />
        </div>

        <div>
          <h2 className="sidebar__brand-name">PennyPilot</h2>
          <p className="sidebar__brand-tagline">Expense Manager</p>
        </div>
      </div>

      <nav className="sidebar__navigation" aria-label="Main navigation">
        {navigationItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p>Serverless expense tracking</p>
        <span>AWS Lambda · DynamoDB</span>
      </div>
    </aside>
  )
}

export default Sidebar