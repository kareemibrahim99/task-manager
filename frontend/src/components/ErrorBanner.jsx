const ErrorBanner = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-[var(--color-ember)] bg-[var(--color-ember-soft)] px-4 py-3 text-sm text-[var(--color-ember)]"
    >
      {message}
    </div>
  );
};

export default ErrorBanner;
