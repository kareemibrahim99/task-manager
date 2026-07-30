import { useState } from "react";

import Modal from "./Modal.jsx";

const ProjectForm = ({ initialValues, onSubmit, onClose }) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(initialValues);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Project name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? "Edit project" : "New project"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-[var(--color-ink)]">
            Name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            placeholder="Website redesign"
          />
          {errors.name && <p className="mt-1 text-sm text-[var(--color-ember)]">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-[var(--color-ink)]">
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
            placeholder="What is this project about?"
          />
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
            {submitting ? "Saving…" : isEditing ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
