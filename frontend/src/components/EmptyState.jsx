const EmptyState = ({ title, description, action }) => (
  <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-12 text-center">
    <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
    {description && (
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)] max-w-sm mx-auto">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
