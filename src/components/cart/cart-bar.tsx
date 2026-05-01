"use client";

import { motion } from "framer-motion";
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
    <motion.div
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full border-t border-border-subtle bg-surface-elevated/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      initial={{ y: 88, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-caption text-text-muted">{count} item{count === 1 ? "" : "s"}</p>
          <p className="text-lg font-semibold text-text-primary">₹{total}</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-brand-primary px-4 text-label text-text-inverse shadow-button-primary transition-colors hover:bg-brand-primary-hover active:scale-95"
        >
          Proceed to checkout
        </Link>
      </div>
    </motion.div>
  );
}
