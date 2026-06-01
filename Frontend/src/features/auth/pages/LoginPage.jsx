import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.context";
import { validateLogin } from "../hooks/useAuthFields";
import "../auth.form.scss";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to sign in.";
      setSubmitError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <h1>QueueSense</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {location.state?.registered ? (
            <p className="inline-msg inline-msg--success" style={{ margin: "0 0 0.25rem" }}>
              Account created. Sign in with your email and password.
            </p>
          ) : null}
          <label>
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email ? (
              <span className="auth-form__error">{fieldErrors.email}</span>
            ) : null}
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password ? (
              <span className="auth-form__error">{fieldErrors.password}</span>
            ) : null}
          </label>

          {submitError ? <p className="auth-form__error">{submitError}</p> : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>

          <p className="auth-form__hint">
            No account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
