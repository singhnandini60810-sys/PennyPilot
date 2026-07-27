import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";

export function ForgotPasswordPage() {
  const {
    forgotPassword,
    resetPassword,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [success, setSuccess] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    clearError();

    return () => clearError();
  }, [clearError]);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();

    clearError();
    setLocalError("");
    setSuccess("");

    if (!email.trim()) {
      setLocalError("Please enter your email.");
      return;
    }

    try {
      await forgotPassword(email);

      setCodeSent(true);
      setSuccess("Password reset code sent successfully.");
    } catch {
      // handled by AuthContext
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();

    clearError();
    setLocalError("");
    setSuccess("");

    if (!code.trim()) {
      setLocalError("Enter the verification code.");
      return;
    }

    if (!newPassword) {
      setLocalError("Enter a new password.");
      return;
    }

    try {
      await resetPassword(
        email,
        code,
        newPassword,
      );

      setSuccess(
        "Password changed successfully. You can now sign in."
      );
    } catch {
      // handled by AuthContext
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll help you reset it securely."
    >
      {!codeSent ? (
        <form
          className="auth-form"
          onSubmit={handleSendCode}
        >
          {(localError || error) && (
            <div className="auth-error">
              {localError || error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <button
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Sending..."
              : "Send Reset Code"}
          </button>

          <div className="auth-links">
            <Link to="/login">
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <form
          className="auth-form"
          onSubmit={handleResetPassword}
        >
          {(localError || error) && (
            <div className="auth-error">
              {localError || error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Verification Code</label>

            <input
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.replace(/\D/g, "")
                )
              }
            />
          </div>

          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
            />
          </div>

          <button
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Updating..."
              : "Reset Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}