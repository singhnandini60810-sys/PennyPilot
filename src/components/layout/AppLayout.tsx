import { Outlet } from 'react-router-dom'
import Header from './Header'
import MobileNavigation from './MobileNavigation'
import Sidebar from './Sidebar'

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-layout__main">
        <Header />

        <div className="app-layout__content">
          <Outlet />
        </div>
      </div>

      <MobileNavigation />
    </div>
  )
}

export default AppLayout