import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'

function MobileNavigation() {
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      {navigationItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `mobile-navigation__link ${
              isActive ? 'mobile-navigation__link--active' : ''
            }`
          }
        >
          <Icon size={20} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default MobileNavigation