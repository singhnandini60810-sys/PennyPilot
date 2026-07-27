import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";

interface VerifyEmailLocationState {
  email?: string;
  message?: string;
}

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    verifyEmail,
    resendCode,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const state =
    location.state as VerifyEmailLocationState | null;

  const [email, setEmail] = useState(state?.email ?? "");
  const [verificationCode, setVerificationCode] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    state?.message ?? "",
  );

  useEffect(() => {
    clearError();

    return () => {
      clearError();
    };
  }, [clearError]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLocalError("");
    setSuccessMessage("");
    clearError();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = verificationCode.trim();

    if (!normalizedEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!normalizedCode) {
      setLocalError("Please enter the verification code.");
      return;
    }

    if (!/^\d+$/.test(normalizedCode)) {
      setLocalError(
        "The verification code should contain numbers only.",
      );
      return;
    }

    try {
      await verifyEmail(normalizedEmail, normalizedCode);

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your email has been verified. You can now sign in.",
        },
      });
    } catch {
      // AuthContext already stores the Cognito error.
    }
  }

  async function handleResendCode() {
    setLocalError("");
    setSuccessMessage("");
    clearError();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setLocalError(
        "Enter your email address before requesting another code.",
      );
      return;
    }

    try {
      await resendCode(normalizedEmail);

      setSuccessMessage(
        "A new verification code has been sent to your email.",
      );
    } catch {
      // AuthContext already stores the Cognito error.
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the verification code sent by Amazon Cognito to activate your PennyPilot account."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {successMessage && (
          <div className="auth-success" role="status">
            {successMessage}
          </div>
        )}

        {(localError || error) && (
          <div className="auth-error" role="alert">
            {localError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="verify-email">Email address</label>

          <input
            id="verify-email"
            name="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            onChange={(event) => {
              setEmail(event.target.value);
              setLocalError("");
              setSuccessMessage("");
              clearError();
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="verification-code">
            Verification code
          </label>

          <input
            id="verification-code"
            name="verificationCode"
            className="verification-code-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={verificationCode}
            placeholder="Enter the 6-digit code"
            autoComplete="one-time-code"
            disabled={isLoading}
            onChange={(event) => {
              const numericValue = event.target.value.replace(
                /\D/g,
                "",
              );

              setVerificationCode(numericValue);
              setLocalError("");
              setSuccessMessage("");
              clearError();
            }}
          />
        </div>

        <button
          className="auth-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify email"}
        </button>

        <button
          className="auth-secondary-button"
          type="button"
          disabled={isLoading}
          onClick={handleResendCode}
        >
          Resend verification code
        </button>

        <div className="auth-links">
          <span>Already verified? </span>
          <Link to="/login">Return to sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}