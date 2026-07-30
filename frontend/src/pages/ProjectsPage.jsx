import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as projectsApi from "../api/projects";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import ProjectForm from "../components/ProjectForm.jsx";

const ProjectsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await projectsApi.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (values) => {
    try {
      await projectsApi.createProject(values);
      setShowForm(false);
      showSuccess("Project created.");
      load();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Your projects</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {user?.role === "Admin"
                ? "As an Admin, you can see every project."
                : "Projects you own or belong to."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            New project
          </button>
        </div>

        <div className="mt-6">
          {loading && <LoadingSpinner label="Loading your projects" />}

          {!loading && error && <ErrorBanner message={error} />}

          {!loading && !error && projects.length === 0 && (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start tracking tasks with your team."
              action={
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
                >
                  New project
                </button>
              }
            />
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md"
                >
                  <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
                    {project.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-soft)]">
                    {project.description || "No description yet."}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                    <span>{project.members.length} member{project.members.length === 1 ? "" : "s"}</span>
                    <span>Owner: {project.owner.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && <ProjectForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default ProjectsPage;
