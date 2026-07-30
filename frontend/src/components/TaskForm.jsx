import { useState } from "react";

import Modal from "./Modal.jsx";

const STATUSES = ["To Do", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];

const TaskForm = ({ initialValues, members, onSubmit, onClose }) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [status, setStatus] = useState(initialValues?.status || "To Do");
  const [priority, setPriority] = useState(initialValues?.priority || "Medium");
  const [dueDate, setDueDate] = useState(
    initialValues?.dueDate ? initialValues.dueDate.slice(0, 10) : ""
  );
  const [assignee, setAssignee] = useState(initialValues?.assignee?._id || "");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(initialValues);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Task title is required.";
    if (dueDate && Number.isNaN(new Date(dueDate).getTime())) {
      next.dueDate = "Enter a valid date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        assignee: assignee || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? "Edit task" : "New task"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-[var(--color-ink)]">
            Title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            placeholder="Set up staging environment"
          />
          {errors.title && <p className="mt-1 text-sm text-[var(--color-ember)]">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-[var(--color-ink)]">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-[var(--color-ink)]">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="block text-sm font-medium text-[var(--color-ink)]">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-sm font-medium text-[var(--color-ink)]">
              Due date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            />
            {errors.dueDate && <p className="mt-1 text-sm text-[var(--color-ember)]">{errors.dueDate}</p>}
          </div>

          <div>
            <label htmlFor="task-assignee" className="block text-sm font-medium text-[var(--color-ink)]">
              Assignee
            </label>
            <select
              id="task-assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEditing ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
