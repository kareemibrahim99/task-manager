import Modal from "./Modal.jsx";

const ConfirmDialog = ({ title, message, confirmLabel = "Delete", onConfirm, onCancel, busy }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="text-sm text-[var(--color-ink-soft)]">{message}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="rounded-md bg-[var(--color-ember)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Deleting…" : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
