"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBookingsFromCart } from "@/app/checkout/actions";
import { useCart } from "@/components/cart/use-cart";

const DEFAULT_SLOTS = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
  "19:00 - 21:00"
] as const;

export function CheckoutClient({
  loggedIn,
  prices
}: {
  loggedIn: boolean;
  prices: Record<string, number>;
}) {
  const { cart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const payload = useMemo(() => {
    return JSON.stringify({ items: cart.items });
  }, [cart.items]);

  const count = useMemo(() => cart.items.reduce((a, i) => a + i.quantity, 0), [cart.items]);
  const total = useMemo(
    () => cart.items.reduce((a, i) => a + (prices[i.serviceId] ?? 0) * i.quantity, 0),
    [cart.items, prices]
  );

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  const dateOptions = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const value = `${y}-${m}-${day}`;
    const label =
      i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString(undefined, { weekday: "short" });
    return { value, label };
  });

  if (!mounted) return null;

  if (!loggedIn) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Checkout</h1>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Please login to continue.</p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/customer/login?next=${encodeURIComponent("/checkout")}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition-transform active:scale-95"
            >
              Login
            </Link>
            <Link
              href={`/customer/register?next=${encodeURIComponent("/checkout")}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-transform active:scale-95"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Checkout</h1>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Your cart is empty.</p>
          <Link
            href="/services"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-12">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:col-span-12">
        <p className="text-xs font-semibold text-slate-500">Checkout</p>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{count} item{count === 1 ? "" : "s"}</p>
            <p className="text-xs text-slate-500">Cash on delivery / Pay after service only</p>
          </div>
          <button
            type="button"
            onClick={() => clearCart()}
            className="inline-flex h-11 items-center rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-transform active:scale-95"
          >
            Clear cart
          </button>
        </div>
      </section>

      <form
        action={async (fd) => {
          await createBookingsFromCart(fd);
          clearCart();
        }}
        className="space-y-5 md:col-span-7"
      >
        <input type="hidden" name="cartPayload" value={payload} />

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Step 1</p>
            <h2 className="text-sm font-semibold text-slate-900">Location</h2>
          </div>
          <textarea
            name="address"
            required
            placeholder="House/Flat, street, landmark"
            className="min-h-24 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
          />
          <input
            name="region"
            placeholder="Zone/Region (optional)"
            className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Step 2</p>
            <h2 className="text-sm font-semibold text-slate-900">Slot selection</h2>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {dateOptions.map((d) => (
              <label key={d.value} className="shrink-0">
                <input
                  type="radio"
                  name="scheduledDate"
                  value={d.value}
                  defaultChecked={d.value === defaultDate}
                  className="peer sr-only"
                  required
                />
                <span className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-slate-200 bg-white text-slate-700 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:ring-blue-600 transition-transform active:scale-95">
                  {d.label}
                </span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_SLOTS.map((slot, idx) => (
              <label key={slot} className="block">
                <input
                  type="radio"
                  name="scheduledTimeSlot"
                  value={slot}
                  defaultChecked={idx === 0}
                  className="peer sr-only"
                />
                <span className="flex h-11 items-center justify-center rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:ring-blue-600 transition-transform active:scale-95">
                  {slot}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Step 3</p>
            <h2 className="text-sm font-semibold text-slate-900">Confirm</h2>
          </div>
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            className="min-h-20 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
          />
          <button className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-transform active:scale-95">
            Place booking (COD)
          </button>
        </section>
      </form>

      <aside className="md:col-span-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:sticky md:top-[76px] space-y-3">
          <p className="text-sm font-semibold text-slate-900">Receipt</p>
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">₹{total}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Taxes</span>
              <span className="font-semibold text-slate-900">₹0</span>
            </div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="text-lg font-semibold text-slate-900">₹{total}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">Payment: COD / pay after service only.</p>
        </div>
      </aside>
    </div>
  );
}

