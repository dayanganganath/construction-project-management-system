import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

import "../styles/password-reset.css";

function ForgotPassword() {
  const [step, setStep] =
    useState("request");

  const [email, setEmail] =
    useState("");

  const [code, setCode] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const requestCode =
    async (event) => {
      event.preventDefault();

      if (!email.trim()) {
        setError(
          "Email address is required."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response =
          await api.post(
            "/auth/password-reset/request",
            {
              email:
                email.trim(),
            }
          );

        setMessage(
          response.data
            ?.message ||
            "If an account exists for this email, a verification code has been sent."
        );

        setStep("reset");
      } catch (error) {
        console.error(
          "Password reset request error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to send the verification code."
        );
      } finally {
        setLoading(false);
      }
    };

  const resetPassword =
    async (event) => {
      event.preventDefault();

      if (
        !code.trim() ||
        !newPassword ||
        !confirmPassword
      ) {
        setError(
          "Code and both password fields are required."
        );
        return;
      }

      if (
        newPassword.length < 8
      ) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Password confirmation does not match."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");
        setMessage("");

        await api.post(
          "/auth/password-reset/confirm",
          {
            email:
              email.trim(),
            code:
              code.trim(),
            newPassword,
            confirmPassword,
          }
        );

        setStep("success");
      } catch (error) {
        console.error(
          "Password reset error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    };

  const resendCode =
    async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response =
          await api.post(
            "/auth/password-reset/request",
            {
              email:
                email.trim(),
            }
          );

        setMessage(
          response.data
            ?.message ||
            "A new verification code has been requested."
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to resend the verification code."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="login-page">
      <div className="login-card password-reset-card">
        <div className="login-brand">
          <h1>CPMS</h1>
          <p>
            Construction Project
            Management System
          </p>
        </div>

        {step ===
          "request" && (
          <>
            <div className="password-reset-heading">
              <h2>
                Forgot Password
              </h2>
              <p>
                Enter the email
                address linked to
                your CPMS account.
                We will send a
                6-digit verification
                code.
              </p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={
                requestCode
              }
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                  setError("");
                }}
                autoComplete="email"
              />

              <button
                type="submit"
                className="login-button"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Sending..."
                  : "Send Code"}
              </button>
            </form>
          </>
        )}

        {step ===
          "reset" && (
          <>
            <div className="password-reset-heading">
              <h2>
                Enter Verification Code
              </h2>
              <p>
                Check your email for
                the 6-digit code.
                The code expires in
                10 minutes.
              </p>
            </div>

            {message && (
              <div className="password-reset-message">
                {message}
              </div>
            )}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={
                resetPassword
              }
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(event) => {
                  setCode(
                    event.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                  );
                  setError("");
                }}
                autoComplete="one-time-code"
              />

              <input
                type="password"
                placeholder="New password"
                value={
                  newPassword
                }
                onChange={(event) => {
                  setNewPassword(
                    event.target.value
                  );
                  setError("");
                }}
                autoComplete="new-password"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={
                  confirmPassword
                }
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );
                  setError("");
                }}
                autoComplete="new-password"
              />

              <div className="password-reset-note">
                Minimum 8 characters.
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>

              <button
                type="button"
                className="password-reset-secondary"
                onClick={
                  resendCode
                }
                disabled={
                  loading
                }
              >
                Resend Code
              </button>
            </form>
          </>
        )}

        {step ===
          "success" && (
          <div className="password-reset-success">
            <div className="password-reset-success-icon">
              ✓
            </div>

            <h2>
              Password Reset
              Successful
            </h2>

            <p>
              Your password has
              been updated. You can
              now sign in using your
              new password.
            </p>

            <Link
              to="/login"
              className="login-button password-reset-login-link"
            >
              Back to Login
            </Link>
          </div>
        )}

        {step !==
          "success" && (
          <Link
            to="/login"
            className="password-reset-back-link"
          >
            ← Back to Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
