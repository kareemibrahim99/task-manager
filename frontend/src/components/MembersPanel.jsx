import { useState } from "react";

import Modal from "./Modal.jsx";

const MembersPanel = ({ project, isAdmin, onAdd, onRemove, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter an email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onAdd(email.trim());
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    try {
      await onRemove(userId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal title="Project members" onClose={onClose}>
      <ul className="divide-y divide-[var(--color-line)]">
        {project.members.map((member) => (
          <li key={member._id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">{member.name}</p>
              <p className="text-xs text-[var(--color-ink-soft)]">{member.email}</p>
            </div>
            {isAdmin && member._id !== project.owner._id && (
              <button
                type="button"
                onClick={() => handleRemove(member._id)}
                disabled={removingId === member._id}
                className="text-sm font-medium text-[var(--color-ember)] hover:underline disabled:opacity-60"
              >
                {removingId === member._id ? "Removing…" : "Remove"}
              </button>
            )}
            {member._id === project.owner._id && (
              <span className="text-xs text-[var(--color-ink-soft)]">Owner</span>
            )}
          </li>
        ))}
      </ul>

      {isAdmin ? (
        <form onSubmit={handleAdd} noValidate className="mt-5 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            className="flex-1 rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
      ) : (
        <p className="mt-5 text-sm text-[var(--color-ink-soft)]">
          Only an Admin can add or remove members.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-[var(--color-ember)]">{error}</p>}
    </Modal>
  );
};

export default MembersPanel;
