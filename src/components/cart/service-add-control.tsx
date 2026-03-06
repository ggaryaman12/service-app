"use client";

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
      <button
        type="button"
        onClick={() => addToCart(serviceId, 1)}
        className="inline-flex h-11 items-center justify-center rounded-full bg-green-600 px-4 text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
      >
        + ADD
      </button>
    );
  }

  return (
    <div className="inline-flex h-11 items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => removeFromCart(serviceId, 1)}
        className="inline-flex h-11 w-11 items-center justify-center text-slate-900 transition-transform active:scale-95"
        aria-label="Remove one"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M19 13H5v-2h14v2z" />
        </svg>
      </button>
      <span className="min-w-10 px-2 text-center text-sm font-semibold text-slate-900">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => addToCart(serviceId, 1)}
        className="inline-flex h-11 w-11 items-center justify-center text-slate-900 transition-transform active:scale-95"
        aria-label="Add one"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
}

