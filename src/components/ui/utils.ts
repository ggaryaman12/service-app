import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "heading-1",
        "heading-2",
        "heading-3",
        "body",
        "body-sm",
        "label",
        "caption",
        "caption-small"
      ],
      color: [
        "brand-primary",
        "brand-primary-hover",
        "brand-primary-muted",
        "brand-secondary",
        "brand-secondary-muted",
        "surface-default",
        "surface-elevated",
        "surface-muted",
        "surface-inverse",
        "surface-skeleton-base",
        "surface-skeleton-highlight",
        "text-primary",
        "text-secondary",
        "text-muted",
        "text-inverse",
        "border-subtle",
        "border-strong",
        "state-success",
        "state-danger",
        "state-warning",
        "state-info"
      ]
    }
  }
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
