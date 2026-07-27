import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";

interface LocationState {
  from?: {
    pathname?: string;
  };
  message?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const state = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();

    return () => {
      clearError();
    };
  }, [clearError]);

  if (isAuthenticated) {
    const destination = state?.from?.pathname || "/";

    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError("");
    clearError();

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    try {
      await login(email, password);

      const destination = state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch {
      // AuthContext already stores and displays the Cognito error.
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your expenses, reports and savings goals."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {state?.message && (
          <div className="auth-success" role="status">
            {state.message}
          </div>
        )}

        {(localError || error) && (
          <div className="auth-error" role="alert">
            {localError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            onChange={(event) => {
              setEmail(event.target.value);
              setLocalError("");
              clearError();
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>

          <div className="password-input-wrapper">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              onChange={(event) => {
                setPassword(event.target.value);
                setLocalError("");
                clearError();
              }}
            />

            <button
              className="password-toggle"
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="auth-form-options">
          <label className="remember-option">
            <input type="checkbox" disabled={isLoading} />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button
          className="auth-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <div className="auth-links">
          <span>New to PennyPilot? </span>
          <Link to="/signup">Create an account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}