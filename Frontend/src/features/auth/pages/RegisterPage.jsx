import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.context";
import { validateRegister } from "../hooks/useAuthFields";
import "../auth.form.scss";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    const errors = validateRegister({ name, email, password, confirmPassword });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to register.";
      setSubmitError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <h1>Create account</h1>
          <p>Join QueueSense</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name ? (
              <span className="auth-form__error">{fieldErrors.name}</span>
            ) : null}
          </label>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password ? (
              <span className="auth-form__error">{fieldErrors.password}</span>
            ) : null}
          </label>

          <label>
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword ? (
              <span className="auth-form__error">{fieldErrors.confirmPassword}</span>
            ) : null}
          </label>

          {submitError ? <p className="auth-form__error">{submitError}</p> : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </button>

          <p className="auth-form__hint">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
