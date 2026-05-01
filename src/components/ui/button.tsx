"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "./utils";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonTone = "primary" | "neutral" | "danger";

type ButtonMotionProps = Omit<
  HTMLMotionProps<"button">,
  "aria-busy" | "disabled" | "whileTap"
>;

export interface ButtonProps extends ButtonMotionProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  loading?: boolean;
  disabled?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-ui-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default disabled:pointer-events-none disabled:opacity-50";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-caption",
  md: "h-11 px-4 text-label",
  lg: "h-12 px-5 text-body-sm"
};

const variantClasses: Record<ButtonVariant, Record<ButtonTone, string>> = {
  solid: {
    primary:
      "bg-brand-primary text-text-inverse shadow-button-primary hover:bg-brand-primary-hover",
    neutral: "bg-surface-inverse text-text-inverse hover:opacity-90",
    danger: "bg-state-danger text-text-inverse hover:opacity-90"
  },
  outline: {
    primary:
      "border border-brand-primary bg-surface-elevated text-brand-primary hover:bg-brand-primary-muted",
    neutral:
      "border border-border-strong bg-surface-elevated text-text-primary hover:bg-surface-muted",
    danger:
      "border border-state-danger bg-surface-elevated text-state-danger hover:bg-surface-muted"
  },
  ghost: {
    primary: "text-brand-primary hover:bg-brand-primary-muted",
    neutral: "text-text-secondary hover:bg-surface-muted",
    danger: "text-state-danger hover:bg-surface-muted"
  }
};

export function Button({
  className,
  variant = "solid",
  size = "md",
  tone = "primary",
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      {...props}
      type={type}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant][tone],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
    >
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}
