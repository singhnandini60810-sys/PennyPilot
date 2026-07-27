import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const navigate = useNavigate();

  const {
    register,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    clearError();

    return () => {
      clearError();
    };
  }, [clearError]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError("");
    clearError();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setLocalError("Please enter your full name.");
      return;
    }

    if (!normalizedEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!password) {
      setLocalError("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setLocalError(
        "Password must contain at least one uppercase letter.",
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setLocalError(
        "Password must contain at least one lowercase letter.",
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      setLocalError("Password must contain at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setLocalError(
        "Password must contain at least one special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("The passwords do not match.");
      return;
    }

    try {
      await register({
        name: normalizedName,
        email: normalizedEmail,
        password,
      });

      navigate("/verify-email", {
        replace: true,
        state: {
          email: normalizedEmail,
          message:
            "Your account was created. Enter the verification code sent to your email.",
        },
      });
    } catch {
      // AuthContext already stores the Cognito error.
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking expenses and building better financial habits."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {(localError || error) && (
          <div className="auth-error" role="alert">
            {localError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="signup-name">Full name</label>

          <input
            id="signup-name"
            name="name"
            type="text"
            value={name}
            placeholder="Enter your full name"
            autoComplete="name"
            disabled={isLoading}
            onChange={(event) => {
              setName(event.target.value);
              setLocalError("");
              clearError();
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-email">Email address</label>

          <input
            id="signup-email"
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
          <label htmlFor="signup-password">Password</label>

          <div className="password-input-wrapper">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Create a secure password"
              autoComplete="new-password"
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
              onClick={() =>
                setShowPassword((currentValue) => !currentValue)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="password-requirements">
          Use at least 8 characters with uppercase, lowercase, number
          and special character.
        </div>

        <div className="form-group">
          <label htmlFor="signup-confirm-password">
            Confirm password
          </label>

          <div className="password-input-wrapper">
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Enter your password again"
              autoComplete="new-password"
              disabled={isLoading}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setLocalError("");
                clearError();
              }}
            />

            <button
              className="password-toggle"
              type="button"
              disabled={isLoading}
              onClick={() =>
                setShowConfirmPassword(
                  (currentValue) => !currentValue,
                )
              }
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <label className="terms-option">
          <input type="checkbox" required disabled={isLoading} />

          <span>
            I agree to the PennyPilot terms and privacy policy.
          </span>
        </label>

        <button
          className="auth-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>

        <div className="auth-links">
          <span>Already have an account? </span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}