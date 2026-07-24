import { Outlet } from "react-router-dom";

import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import Sidebar from "./Sidebar";

import "./layout.css";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__main">
        <Header />

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}