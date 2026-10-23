import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../services/api";

import "../styles/client-invite.css";

function Login() {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const activationToken =
    searchParams.get(
      "activation"
    );

  const activationMode =
    Boolean(
      activationToken
    );

  const [form, setForm] =
    useState({
      username: "",
      password: "",
    });

  const [
    activationForm,
    setActivationForm,
  ] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [
    tokenValid,
    setTokenValid,
  ] = useState(null);

  const [
    activationSuccess,
    setActivationSuccess,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    validating,
    setValidating,
  ] = useState(false);

  useEffect(() => {
    if (activationToken) {
      validateActivationToken();
    }
  }, [activationToken]);

  const validateActivationToken =
    async () => {
      try {
        setValidating(true);
        setError("");
        setTokenValid(null);

        await api.get(
          "/auth/activation/validate",
          {
            params: {
              token:
                activationToken,
            },
          }
        );

        setTokenValid(true);
      } catch (error) {
        console.error(
          "Activation token validation error:",
          error
        );

        setTokenValid(false);

        setError(
          error.response?.data
            ?.message ||
            "This activation link is invalid or expired."
        );
      } finally {
        setValidating(
          false
        );
      }
    };

  const handleChange = (
    event
  ) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });

    setError("");
  };

  const handleActivationChange =
    (event) => {
      setActivationForm({
        ...activationForm,
        [event.target.name]:
          event.target.value,
      });

      setError("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !form.username.trim() ||
        !form.password.trim()
      ) {
        setError(
          "Username and password are required."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.post(
            "/auth/login",
            {
              username:
                form.username
                  .trim(),

              password:
                form.password,
            }
          );

        if (
          response.data.success
        ) {
          const role =
            response.data.role;

          localStorage.setItem(
            "isAuthenticated",
            "true"
          );

          localStorage.setItem(
            "username",
            response.data
              .username
          );

          localStorage.setItem(
            "role",
            role
          );

          localStorage.setItem(
            "token",
            response.data.token
          );

          if (
            role === "CLIENT"
          ) {
            navigate(
              "/client",
              {
                replace: true,
              }
            );
          } else if (
            role ===
            "SUPERVISOR"
          ) {
            navigate(
              "/supervisor",
              {
                replace: true,
              }
            );
          } else if (
            role ===
            "CONTRACTOR"
          ) {
            navigate(
              "/contractor",
              {
                replace: true,
              }
            );
          } else {
            navigate(
              "/",
              {
                replace: true,
              }
            );
          }
        } else {
          setError(
            response.data
              .message ||
              "Login failed."
          );
        }
      } catch (error) {
        console.error(
          "Login error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to login. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleActivationSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !activationForm
          .newPassword
      ) {
        setError(
          "New password is required."
        );

        return;
      }

      if (
        activationForm
          .newPassword.length <
        8
      ) {
        setError(
          "Password must contain at least 8 characters."
        );

        return;
      }

      if (
        activationForm
          .newPassword !==
        activationForm
          .confirmPassword
      ) {
        setError(
          "Password confirmation does not match."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        await api.post(
          "/auth/activation",
          {
            token:
              activationToken,

            newPassword:
              activationForm
                .newPassword,

            confirmPassword:
              activationForm
                .confirmPassword,
          }
        );

        setActivationSuccess(
          true
        );

        setTokenValid(false);
      } catch (error) {
        console.error(
          "Account activation error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to activate account."
        );
      } finally {
        setLoading(false);
      }
    };

  const returnToLogin =
    () => {
      setSearchParams({});

      setActivationSuccess(
        false
      );

      setTokenValid(null);

      setError("");

      setActivationForm({
        newPassword: "",
        confirmPassword: "",
      });
    };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>
            CPMS
          </h1>

          <p>
            Construction Project
            Management System
          </p>
        </div>

        {activationMode ? (
          <>
            <div className="activation-login-heading">
              <span>
                CLIENT ACTIVATION
              </span>

              <h2>
                Activate Account
              </h2>

              <p>
                Create your password
                to access the client
                portal.
              </p>
            </div>

            {validating && (
              <div className="activation-loading">
                Validating activation
                link...
              </div>
            )}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {activationSuccess ? (
              <div className="activation-success-box">
                <div className="activation-success-icon">
                  ✓
                </div>

                <h3>
                  Account Activated
                </h3>

                <p>
                  Your password has
                  been created
                  successfully. You
                  can now sign in to
                  the client portal.
                </p>

                <button
                  type="button"
                  className="login-button"
                  onClick={
                    returnToLogin
                  }
                >
                  Continue to Login
                </button>
              </div>
            ) : tokenValid ===
              true ? (
              <form
                className="login-form"
                onSubmit={
                  handleActivationSubmit
                }
              >
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={
                    activationForm
                      .newPassword
                  }
                  onChange={
                    handleActivationChange
                  }
                  autoComplete="new-password"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={
                    activationForm
                      .confirmPassword
                  }
                  onChange={
                    handleActivationChange
                  }
                  autoComplete="new-password"
                />

                <div className="activation-password-note">
                  Minimum 8
                  characters.
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={
                    loading
                  }
                >
                  {loading
                    ? "Activating..."
                    : "Activate Account"}
                </button>
              </form>
            ) : (
              !validating && (
                <button
                  type="button"
                  className="login-button"
                  onClick={
                    returnToLogin
                  }
                >
                  Back to Login
                </button>
              )
            )}
          </>
        ) : (
          <>
            <h2>
              Login
            </h2>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={
                handleSubmit
              }
            >
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={
                  form.username
                }
                onChange={
                  handleChange
                }
                autoComplete="username"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                autoComplete="current-password"
              />

              <button
                type="submit"
                className="login-button"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;