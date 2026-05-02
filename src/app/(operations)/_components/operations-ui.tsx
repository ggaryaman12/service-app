import type { ButtonHTMLAttributes, ReactNode } from "react";

type StatusTone = "accent" | "success" | "warning" | "danger" | "neutral" | "dark";

const statusToneVars: Record<StatusTone, { bg: string; text: string; border: string }> = {
  accent: {
    bg: "var(--portal-accent-soft)",
    text: "var(--portal-accent-text)",
    border: "color-mix(in srgb, var(--portal-accent) 36%, white)"
  },
  success: {
    bg: "color-mix(in srgb, var(--portal-success) 14%, white)",
    text: "var(--portal-success)",
    border: "color-mix(in srgb, var(--portal-success) 28%, white)"
  },
  warning: {
    bg: "color-mix(in srgb, var(--portal-warning) 16%, white)",
    text: "#8a5a00",
    border: "color-mix(in srgb, var(--portal-warning) 30%, white)"
  },
  danger: {
    bg: "color-mix(in srgb, var(--portal-danger) 12%, white)",
    text: "var(--portal-danger)",
    border: "color-mix(in srgb, var(--portal-danger) 26%, white)"
  },
  neutral: {
    bg: "var(--portal-surface-muted)",
    text: "var(--portal-text-muted)",
    border: "var(--portal-border)"
  },
  dark: {
    bg: "var(--portal-sidebar-bg)",
    text: "#ffffff",
    border: "var(--portal-sidebar-bg)"
  }
};

export const operationsInputClass =
  "min-h-11 rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 py-2 text-sm text-[var(--portal-text)] outline-none transition focus:border-[var(--portal-accent)] focus:ring-2 focus:ring-[var(--portal-accent-soft)]";

export const operationsSelectClass = operationsInputClass;

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function statusTone(status: string): StatusTone {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "PENDING") return "warning";
  if (status === "CONFIRMED") return "accent";
  return "dark";
}

export function OperationsPageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--portal-accent-text)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--portal-text)] md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--portal-text-muted)]">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function OperationsButton({
  children,
  tone = "dark",
  className = "",
  type,
  ...props
}: {
  children: ReactNode;
  tone?: "dark" | "light" | "danger" | "accent";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes =
    tone === "danger"
      ? "bg-[var(--portal-danger)] text-white hover:brightness-95"
      : tone === "light"
        ? "border border-[var(--portal-border)] bg-[var(--portal-surface)] text-[var(--portal-text)] hover:bg-[var(--portal-surface-muted)]"
        : tone === "accent"
          ? "bg-[var(--portal-accent)] text-white hover:bg-[var(--portal-accent-strong)]"
          : "bg-[var(--portal-sidebar-bg)] text-white hover:brightness-110";

  return (
    <button
      {...props}
      type={type}
      className={[
        "inline-flex min-h-10 items-center justify-center rounded-ui-sm px-4 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
        classes,
        className
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function OperationsMetricCard({
  label,
  value,
  detail,
  tone = "accent"
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "accent" | "success" | "warning" | "danger" | "dark";
}) {
  const fill =
    tone === "success"
      ? "var(--portal-success)"
      : tone === "warning"
        ? "var(--portal-warning)"
        : tone === "danger"
          ? "var(--portal-danger)"
          : tone === "dark"
            ? "var(--portal-sidebar-bg)"
            : "var(--portal-accent)";

  return (
    <div className="group rounded-ui border border-[var(--portal-border)] bg-[var(--portal-surface)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-bold text-[var(--portal-text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-[var(--portal-text)]">{value}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--portal-surface-muted)]">
        <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: fill }} />
      </div>
      <p className="mt-2 text-xs text-[var(--portal-text-muted)]">{detail}</p>
    </div>
  );
}

export function OperationsPanel({
  title,
  description,
  children,
  dark = false,
  className = ""
}: {
  title: string;
  description?: string;
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section
      className={[
        "overflow-hidden rounded-ui border shadow-[0_18px_42px_rgba(15,23,42,0.05)]",
        dark
          ? "border-[var(--portal-sidebar-bg)] bg-[var(--portal-sidebar-bg)] text-white"
          : "border-[var(--portal-border)] bg-[var(--portal-surface)]",
        className
      ].join(" ")}
    >
      <div
        className={[
          "border-b px-4 py-4",
          dark ? "border-white/10" : "border-[var(--portal-border)]"
        ].join(" ")}
      >
        <h2 className="text-sm font-black">{title}</h2>
        {description ? (
          <p className={["mt-1 text-xs", dark ? "text-white/60" : "text-[var(--portal-text-muted)]"].join(" ")}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function OperationsStatusPill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  const toneVars = statusToneVars[tone];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em]"
      style={{ backgroundColor: toneVars.bg, borderColor: toneVars.border, color: toneVars.text }}
    >
      {children}
    </span>
  );
}

export function OperationsField({
  label,
  children,
  className = ""
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={["grid gap-1.5", className].join(" ")}>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function OperationsEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center text-sm font-medium text-[var(--portal-text-muted)]">
      {children}
    </div>
  );
}
