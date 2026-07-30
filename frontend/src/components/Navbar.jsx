import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/projects" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="text-[var(--color-primary)]" aria-hidden="true">◆</span>
          Waypoint
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <span
              className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${
                user.role === "Admin"
                  ? "bg-[var(--color-ember-soft)] text-[var(--color-ember)]"
                  : "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]"
              }`}
            >
              {user.role}
            </span>
            <span className="hidden text-sm text-[var(--color-ink-soft)] sm:inline">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
