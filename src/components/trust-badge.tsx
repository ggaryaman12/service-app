type TrustBadgeProps = {
  label: string;
  tone?: "blue" | "green";
};

export function TrustBadge({ label, tone = "blue" }: TrustBadgeProps) {
  const styles =
    tone === "green"
      ? "bg-brand-primary-muted text-brand-primary ring-brand-primary/15"
      : "bg-brand-secondary-muted text-brand-secondary ring-brand-secondary/15";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-caption ring-1",
        styles
      ].join(" ")}
    >
      <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
        {tone === "green" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4zm-1 13l6-6-1.4-1.4L11 12.2 8.4 9.6 7 11l4 4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M12 2l2.6 6.5 7 .6-5.3 4.3 1.6 6.7L12 16.9 6.1 20l1.6-6.7L2.4 9.1l7-.6L12 2zm0 4.5L10.4 10 6.7 10.3l2.8 2.3-.9 3.6 3.4-2 3.4 2-.9-3.6 2.8-2.3-3.7-.3L12 6.5z" />
          </svg>
        )}
      </span>
      {label}
    </span>
  );
}
