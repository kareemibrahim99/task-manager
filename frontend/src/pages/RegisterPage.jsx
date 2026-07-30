import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email, password });
      navigate("/projects", { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold">
            <span className="text-[var(--color-primary)]">◆</span> Task Manager
          </span>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Create your account to get started.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm"
        >
          <ErrorBanner message={apiError} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-ink)]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
              placeholder="Jane Doe"
            />
            {fieldErrors.name && <p className="mt-1 text-sm text-[var(--color-ember)]">{fieldErrors.name}</p>}
          </div>

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
              placeholder="At least 6 characters"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-[var(--color-ember)]">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--color-ink)]">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-[var(--color-ember)]">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
