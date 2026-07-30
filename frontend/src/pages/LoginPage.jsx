import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/projects", { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold">
            <span className="text-[var(--color-primary)]">◆</span> Task Manager
          </span>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Log in to your team's task board.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm"
        >
          <ErrorBanner message={apiError} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
              placeholder="you@example.com"
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-[var(--color-ember)]">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-[var(--color-ember)]">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-[var(--color-primary)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
