import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "amber" | "green" | "blue" | "red" | "neutral" | "dark";

const toneClasses: Record<Tone, string> = {
  amber: "bg-[#fff7e2] text-[#8a5a00] ring-[#f3d894]",
  green: "bg-[#e8f6ee] text-[#147a42] ring-[#b9e5ca]",
  blue: "bg-[#e8f0ff] text-[#2450a8] ring-[#c5d6ff]",
  red: "bg-[#fff0ee] text-[#b42318] ring-[#f2c0b9]",
  neutral: "bg-[#f3efe7] text-[#5f574c] ring-[#ded5c6]",
  dark: "bg-[#191816] text-white ring-[#191816]"
};

export const adminInputClass =
  "min-h-11 rounded-ui-sm border border-[#ded5c6] bg-white px-3 py-2 text-sm text-[#191816] outline-none transition focus:border-[#b99a50] focus:ring-2 focus:ring-[#f3b43f]/30";

export const adminTextareaClass =
  "min-h-24 rounded-ui-sm border border-[#ded5c6] bg-white px-3 py-2 text-sm text-[#191816] outline-none transition focus:border-[#b99a50] focus:ring-2 focus:ring-[#f3b43f]/30";

export const adminSelectClass = adminInputClass;

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function AdminPageHeader({
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
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8a7446]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#191816] md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f675d]">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminActionButton({
  children,
  tone = "dark",
  className = "",
  type,
  ...props
}: {
  children: ReactNode;
  tone?: "dark" | "light" | "danger";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes =
    tone === "danger"
      ? "bg-[#b42318] text-white hover:bg-[#9f1f15]"
      : tone === "light"
        ? "border border-[#ded5c6] bg-white text-[#191816] hover:bg-[#fbf8ef]"
        : "bg-[#191816] text-white hover:bg-[#2a2824]";

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

export function MetricCard({
  label,
  value,
  detail,
  tone = "amber"
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: Tone;
}) {
  const fill =
    tone === "green"
      ? "bg-[#2f9e67]"
      : tone === "blue"
        ? "bg-[#3282b8]"
        : tone === "red"
          ? "bg-[#e85d4f]"
          : tone === "dark"
            ? "bg-[#191816]"
            : "bg-[#f3b43f]";

  return (
    <div className="group rounded-ui border border-[#e1d8ca] bg-white p-4 shadow-[0_18px_42px_rgba(25,24,22,0.05)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(25,24,22,0.08)]">
      <p className="text-xs font-bold text-[#7a7268]">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-[#191816]">{value}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f0e8db]">
        <div className={`h-full w-2/3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${fill}`} />
      </div>
      <p className="mt-2 text-xs text-[#7a7268]">{detail}</p>
    </div>
  );
}

export function DataPanel({
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
        "overflow-hidden rounded-ui border shadow-[0_18px_42px_rgba(25,24,22,0.05)]",
        dark ? "border-[#191816] bg-[#191816] text-white" : "border-[#e1d8ca] bg-white",
        className
      ].join(" ")}
    >
      <div
        className={[
          "border-b px-4 py-4",
          dark ? "border-white/10" : "border-[#eee6d8]"
        ].join(" ")}
      >
        <h2 className="text-sm font-black">{title}</h2>
        {description ? (
          <p className={["mt-1 text-xs", dark ? "text-white/58" : "text-[#7a7268]"].join(" ")}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ring-1",
        toneClasses[tone]
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function FieldShell({
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
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#7a6f5f]">{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center text-sm font-medium text-[#7a7268]">{children}</div>
  );
}

export function MiniBarChart({
  values,
  label
}: {
  values: Array<{ label: string; value: number }>;
  label: string;
}) {
  const max = Math.max(1, ...values.map((item) => item.value));

  return (
    <div className="p-4">
      <div className="flex h-52 items-end gap-3 border-b border-[#eee6d8] pb-3">
        {values.map((item, index) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={[
                "w-full rounded-t-xl transition-all duration-500",
                index % 2 ? "bg-[#191816]" : "bg-[#f3b43f]"
              ].join(" ")}
              style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-[10px] font-bold text-[#7a7268]">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#7a7268]">{label}</p>
    </div>
  );
}

export function DonutChart({
  segments
}: {
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = Math.max(1, segments.reduce((sum, item) => sum + item.value, 0));
  let cursor = 0;
  const gradient = segments
    .map((item) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 100;
      cursor = end;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[10rem_1fr] sm:items-center">
      <div
        className="mx-auto h-36 w-36 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="grid gap-2">
        {segments.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-bold">{item.label}</span>
            </span>
            <span className="text-white/65">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
