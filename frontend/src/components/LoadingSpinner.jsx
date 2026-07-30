const LoadingSpinner = ({ label = "Loading" }) => (
  <div className="flex items-center gap-3 text-[var(--color-ink-soft)]">
    <span
      className="h-4 w-4 rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-primary)] animate-spin"
      aria-hidden="true"
    />
    <span className="text-sm">{label}…</span>
  </div>
);

export default LoadingSpinner;
