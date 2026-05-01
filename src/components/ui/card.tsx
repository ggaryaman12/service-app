import { type HTMLAttributes } from "react";

import { cn } from "./utils";

type CardVariant = "default" | "elevated" | "muted";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border border-border-subtle bg-surface-elevated",
  elevated: "border border-border-subtle bg-surface-elevated shadow-card",
  muted: "border border-border-subtle bg-surface-muted"
};

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn("rounded-ui border-border-subtle", variantClasses[variant], className)}
      {...props}
    />
  );
}
