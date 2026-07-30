import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as projectsApi from "../api/projects";
import * as tasksApi from "../api/tasks";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import ProjectForm from "../components/ProjectForm.jsx";
import TaskForm from "../components/TaskForm.jsx";
import MembersPanel from "../components/MembersPanel.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const STATUSES = ["To Do", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];

const PRIORITY_STYLES = {
  Low: "bg-[var(--color-slate-soft)] text-[var(--color-slate)]",
  Medium: "bg-[var(--color-amber-soft)] text-[var(--color-amber)]",
  High: "bg-[var(--color-ember-soft)] text-[var(--color-ember)]",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  const [filters, setFilters] = useState({ status: "", priority: "", assignee: "" });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProject = async () => {
    setProjectLoading(true);
    setProjectError("");
    try {
      const data = await projectsApi.getProject(projectId);
      setProject(data);
    } catch (err) {
      setProjectError(err.message);
    } finally {
      setProjectLoading(false);
    }
  };

  const loadTasks = async () => {
    setTasksLoading(true);
    setTasksError("");
    try {
      const data = await tasksApi.listTasks(projectId, filters);
      setTasks(data);
    } catch (err) {
      setTasksError(err.message);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!projectError) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, filters, projectError]);

  const isAdmin = user?.role === "Admin";
  const isOwner = project ? project.owner._id === user?.id : false;
  const canManageProject = isOwner || isAdmin;

  const canModifyTask = (task) =>
    isAdmin ||
    isOwner ||
    task.creator._id === user?.id ||
    (task.assignee && task.assignee._id === user?.id);

  const filtersActive = filters.status || filters.priority || filters.assignee;

  const handleUpdateProject = async (values) => {
    try {
      const updated = await projectsApi.updateProject(projectId, values);
      setProject((prev) => ({ ...prev, ...updated }));
      setShowProjectForm(false);
      showSuccess("Project updated.");
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      await projectsApi.deleteProject(projectId);
      showSuccess("Project deleted.");
      navigate("/projects", { replace: true });
    } catch (err) {
      showError(err.message);
      setDeleting(false);
    }
  };

  const handleAddMember = async (email) => {
    const updated = await projectsApi.addMember(projectId, { email });
    setProject((prev) => ({ ...prev, members: updated.members }));
    showSuccess("Member added.");
  };

  const handleRemoveMember = async (userId) => {
    const updated = await projectsApi.removeMember(projectId, userId);
    setProject((prev) => ({ ...prev, members: updated.members }));
    showSuccess("Member removed.");
  };

  const handleCreateTask = async (values) => {
    try {
      await tasksApi.createTask(projectId, values);
      setShowTaskForm(false);
      showSuccess("Task created.");
      loadTasks();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleUpdateTask = async (taskId, values) => {
    try {
      await tasksApi.updateTask(projectId, taskId, values);
      setEditingTask(null);
      showSuccess("Task updated.");
      loadTasks();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await tasksApi.updateTask(projectId, task._id, { status });
      setTasks((current) => current.map((t) => (t._id === task._id ? { ...t, status } : t)));
      showSuccess(`Marked "${task.title}" as ${status}.`);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteTask = async () => {
    setDeleting(true);
    try {
      await tasksApi.deleteTask(projectId, confirmDeleteTask._id);
      showSuccess("Task deleted.");
      setConfirmDeleteTask(null);
      loadTasks();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const memberOptions = useMemo(() => project?.members || [], [project]);

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)]">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <LoadingSpinner label="Loading project" />
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)]">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ErrorBanner message={projectError} />
          <Link
            to="/projects"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link to="/projects" className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">
          ← All projects
        </Link>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="font-display text-2xl font-semibold">{project.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
              {project.description || "No description yet."}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setShowMembers(true)}
              className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-paper)]"
            >
              Members ({project.members.length})
            </button>
            {canManageProject && (
              <>
                <button
                  type="button"
                  onClick={() => setShowProjectForm(true)}
                  className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-paper)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteProject(true)}
                  className="rounded-md border border-[var(--color-ember)] px-3 py-2 text-sm font-medium text-[var(--color-ember)] hover:bg-[var(--color-ember-soft)]"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={filters.assignee}
              onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
              className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              aria-label="Filter by assignee"
            >
              <option value="">All assignees</option>
              {memberOptions.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowTaskForm(true)}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            New task
          </button>
        </div>

        <div className="mt-4">
          {tasksLoading && <LoadingSpinner label="Loading tasks" />}

          {!tasksLoading && tasksError && <ErrorBanner message={tasksError} />}

          {!tasksLoading && !tasksError && tasks.length === 0 && (
            <EmptyState
              title={filtersActive ? "No tasks match these filters" : "No tasks yet"}
              description={
                filtersActive
                  ? "Try a different combination of filters, or clear them."
                  : "Add the first task to start tracking work on this project."
              }
              action={
                filtersActive ? (
                  <button
                    type="button"
                    onClick={() => setFilters({ status: "", priority: "", assignee: "" })}
                    className="rounded-md border border-[var(--color-line)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-paper)]"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(true)}
                    className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
                  >
                    New task
                  </button>
                )
              }
            />
          )}

          {!tasksLoading && !tasksError && tasks.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const editable = canModifyTask(task);
                    return (
                      <tr key={task._id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--color-ink)]">{task.title}</p>
                          {task.description && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-[var(--color-ink-soft)]">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            disabled={!editable}
                            aria-label={`Status for ${task.title}`}
                            className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-xs disabled:opacity-60"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-soft)]">
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-ink-soft)]">
                          {task.assignee?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editable ? (
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setEditingTask(task)}
                                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTask(task)}
                                className="text-xs font-medium text-[var(--color-ember)] hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--color-ink-soft)]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showProjectForm && (
        <ProjectForm
          initialValues={project}
          onSubmit={handleUpdateProject}
          onClose={() => setShowProjectForm(false)}
        />
      )}

      {showMembers && (
        <MembersPanel
          project={project}
          isAdmin={isAdmin}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showTaskForm && (
        <TaskForm
          members={memberOptions}
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          initialValues={editingTask}
          members={memberOptions}
          onSubmit={(values) => handleUpdateTask(editingTask._id, values)}
          onClose={() => setEditingTask(null)}
        />
      )}

      {confirmDeleteProject && (
        <ConfirmDialog
          title="Delete project"
          message={`Delete "${project.name}" and all of its tasks? This can't be undone.`}
          onConfirm={handleDeleteProject}
          onCancel={() => setConfirmDeleteProject(false)}
          busy={deleting}
        />
      )}

      {confirmDeleteTask && (
        <ConfirmDialog
          title="Delete task"
          message={`Delete "${confirmDeleteTask.title}"? This can't be undone.`}
          onConfirm={handleDeleteTask}
          onCancel={() => setConfirmDeleteTask(null)}
          busy={deleting}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
