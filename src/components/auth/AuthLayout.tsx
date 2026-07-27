import type { ReactNode } from "react";

import {
  BarChart3,
  Cloud,
  PiggyBank,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import "../../styles/auth.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const authenticationFeatures = [
  {
    icon: <ShieldCheck size={19} />,
    title: "Secure authentication",
    description: "Protected with Amazon Cognito",
  },
  {
    icon: <BarChart3 size={19} />,
    title: "Expense analytics",
    description: "Understand your spending patterns",
  },
  {
    icon: <PiggyBank size={19} />,
    title: "Savings goals",
    description: "Track progress towards your targets",
  },
  {
    icon: <Cloud size={19} />,
    title: "Cloud connected",
    description: "Powered by secure AWS services",
  },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <main className="auth-container">
        <section className="auth-left">
          <div className="auth-left__content">
            <header className="auth-brand">
              <div className="auth-brand__icon">
                <WalletCards size={27} />
              </div>

              <div>
                <h1>PennyPilot</h1>
                <p>Smart Expense Management</p>
              </div>
            </header>

            <div className="auth-welcome">
              <span className="auth-welcome__eyebrow">
                Your money, clearly managed
              </span>

              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            {children}
          </div>
        </section>

        <aside className="auth-right">
          <div className="auth-right__overlay" />

          <div className="auth-hero-card">
            <div className="auth-hero-card__badge">
              <WalletCards size={19} />
              Personal finance dashboard
            </div>

            <h2>Take control of every rupee.</h2>

            <p className="auth-hero-card__description">
              Track expenses, understand spending, monitor savings and
              manage your financial activity from one secure dashboard.
            </p>

            <div className="auth-feature-list">
              {authenticationFeatures.map((feature) => (
                <div
                  className="auth-feature"
                  key={feature.title}
                >
                  <div className="auth-feature__icon">
                    {feature.icon}
                  </div>

                  <div>
                    <strong>{feature.title}</strong>
                    <span>{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-hero-card__footer">
              <span className="auth-status-dot" />
              Built with React, TypeScript and AWS
            </div>
          </div>
        </aside>
      </main>

      <footer className="auth-footer">
        <span>
          © {new Date().getFullYear()} PennyPilot
        </span>

        <span>Built with React &amp; AWS</span>
      </footer>
    </div>
  );
}