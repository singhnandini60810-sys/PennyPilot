import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import SavingsPage from "./pages/SavingsPage";
import NotFoundPage from "./pages/NotFoundPage";

import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}

      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      {/* ---------- Protected Routes ---------- */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={<DashboardPage />}
        />

        <Route
          path="/expenses"
          element={<ExpensesPage />}
        />

        <Route
          path="/reports"
          element={<ReportsPage />}
        />

        <Route
          path="/savings"
          element={<SavingsPage />}
        />
      </Route>

      {/* ---------- 404 ---------- */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default App;