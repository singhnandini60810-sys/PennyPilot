import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="brand">
            <h1>PennyPilot</h1>
            <p>Smart Expense Management</p>
          </div>

          <div className="welcome">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="auth-right">
          <div className="hero-card">
            <div className="wallet-icon">💰</div>

            <h2>Track Every Rupee</h2>

            <p>
              Manage expenses, monitor spending,
              visualize reports and achieve your savings
              goals securely with AWS.
            </p>

            <ul>
              <li>✔ Secure Login</li>
              <li>✔ Expense Analytics</li>
              <li>✔ Savings Goals</li>
              <li>✔ Cloud Sync</li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="auth-footer">
        © {new Date().getFullYear()} PennyPilot • Built with React & AWS
      </footer>
    </div>
  );
}