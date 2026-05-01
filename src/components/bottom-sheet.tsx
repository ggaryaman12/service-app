"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

type BottomSheetProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            aria-label="Close sheet"
            onClick={onClose}
            className="absolute inset-0 bg-surface-inverse/45 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl">
            <motion.div
              className="rounded-t-ui-lg bg-surface-elevated shadow-card-hover ring-1 ring-border-subtle"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-center pt-3">
                <div className="h-1.5 w-10 rounded-full bg-border-subtle" />
              </div>
              {title ? (
                <div className="px-4 pt-3">
                  <h2 className="text-body-sm font-semibold text-text-primary">{title}</h2>
                </div>
              ) : null}
              <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
