"use client";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close sheet"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl">
        <div className="rounded-t-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="flex items-center justify-center pt-3">
            <div className="h-1.5 w-10 rounded-full bg-slate-200" />
          </div>
          {title ? (
            <div className="px-4 pt-3">
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            </div>
          ) : null}
          <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

