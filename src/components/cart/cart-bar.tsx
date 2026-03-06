"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/use-cart";

type PriceMap = Record<string, number>;

export function CartBar({ prices }: { prices: PriceMap }) {
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { count, total } = useMemo(() => {
    const count = cart.items.reduce((acc, i) => acc + i.quantity, 0);
    const total = cart.items.reduce((acc, i) => acc + (prices[i.serviceId] ?? 0) * i.quantity, 0);
    return { count, total };
  }, [cart.items, prices]);

  if (!mounted) return null;
  if (count === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full border-t border-slate-200 bg-white/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">{count} item{count === 1 ? "" : "s"}</p>
          <p className="text-lg font-semibold text-slate-900">₹{total}</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
