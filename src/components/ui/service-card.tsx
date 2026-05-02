"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

import { TransitionLink } from "@/components/route-transition";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

export type ServiceCardUiProps = {
  id: string;
  categoryName: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  minutes: number;
  action?: ReactNode;
  className?: string;
};

export function ServiceCardUi({
  id,
  categoryName,
  name,
  description,
  imageUrl,
  price,
  minutes,
  action,
  className
}: ServiceCardUiProps) {
  return (
    <motion.article
      className={cn("group", className)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        variant="elevated"
        className="overflow-hidden transition-shadow duration-200 hover:shadow-card-hover"
      >
        <div className="flex">
          <div className="min-w-0 flex-1 p-4">
            <div className="mb-2 inline-flex items-center rounded-full bg-brand-primary-muted px-2.5 py-1">
              <span className="text-caption text-brand-primary">{categoryName}</span>
            </div>

            <TransitionLink href={`/service/${id}`} transitionLabel={name} className="block">
              <h3 className="text-body-sm font-semibold text-text-primary transition-colors group-hover:text-brand-primary">
                {name}
              </h3>
            </TransitionLink>

            <p className="mt-1.5 line-clamp-2 text-body-sm text-text-secondary">
              {description}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-lg font-bold text-text-primary">₹{price}</span>
              <div className="flex items-center gap-1 text-caption text-text-muted">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>{minutes} mins</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-32 w-28 shrink-0 overflow-hidden bg-surface-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-border-strong"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456zM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423z"
                  />
                </svg>
              </div>
            )}

            {action ? (
              <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
                {action}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
