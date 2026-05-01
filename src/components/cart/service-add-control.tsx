"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useCart } from "@/components/cart/use-cart";

export function ServiceAddControl({
  serviceId
}: {
  serviceId: string;
}) {
  const { cart, addToCart, removeFromCart } = useCart();

  const qty = useMemo(() => {
    return cart.items.find((i) => i.serviceId === serviceId)?.quantity ?? 0;
  }, [cart.items, serviceId]);

  if (qty === 0) {
    return (
      <motion.button
        type="button"
        onClick={() => addToCart(serviceId, 1)}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand-primary px-4 text-caption font-bold text-text-inverse shadow-button-primary transition-colors hover:bg-brand-primary-hover"
        whileTap={{ scale: 0.97 }}
      >
        + ADD
      </motion.button>
    );
  }

  return (
    <div className="inline-flex h-11 items-center overflow-hidden rounded-full bg-surface-elevated shadow-card ring-1 ring-border-subtle">
      <motion.button
        type="button"
        onClick={() => removeFromCart(serviceId, 1)}
        className="inline-flex h-11 w-11 items-center justify-center text-text-primary"
        aria-label="Remove one"
        whileTap={{ scale: 0.9 }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M19 13H5v-2h14v2z" />
        </svg>
      </motion.button>
      <span className="min-w-10 px-2 text-center text-label text-text-primary">
        {qty}
      </span>
      <motion.button
        type="button"
        onClick={() => addToCart(serviceId, 1)}
        className="inline-flex h-11 w-11 items-center justify-center text-text-primary"
        aria-label="Add one"
        whileTap={{ scale: 0.9 }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </motion.button>
    </div>
  );
}
