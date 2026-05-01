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
      <div className="mx-auto w-full max-w-2xl">
        <section className="overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle">
          <div className="bg-brand-primary-muted px-5 py-4">
            <p className="text-caption font-semibold text-brand-primary">Checkout</p>
            <h1 className="mt-1 text-heading-3 text-text-primary">Save your booking before we dispatch</h1>
          </div>
          <div className="space-y-4 p-5">
            <p className="text-body-sm text-text-secondary">
              Login to confirm your cart, choose a service window, and track professional assignment.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/customer/login?next=${encodeURIComponent("/checkout")}`}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
              >
                Login
              </Link>
              <Link
                href={`/customer/register?next=${encodeURIComponent("/checkout")}`}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border-strong bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:bg-surface-muted active:scale-95"
              >
                Register
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <section className="rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle">
          <p className="text-caption font-semibold text-brand-primary">Checkout</p>
          <h1 className="mt-1 text-heading-3 text-text-primary">Your cart is ready for services</h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            Add a service to start a guided checkout with address, slot, and pay-after-service confirmation.
          </p>
          <Link
            href="/services"
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
          >
            Browse services
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-5 pb-24 md:grid-cols-12 md:pb-0">
      <section className="overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle md:col-span-12">
        <div className="bg-brand-primary-muted px-5 py-4">
          <p className="text-caption font-semibold text-brand-primary">Cart checkout</p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-heading-3 text-text-primary">
                {count} item{count === 1 ? "" : "s"} ready to book
              </h1>
              <p className="mt-1 text-body-sm text-text-secondary">
                Cash on delivery / Pay after service only
              </p>
            </div>
            <button
              type="button"
              onClick={() => clearCart()}
              className="inline-flex h-11 items-center justify-center rounded-full bg-surface-elevated px-4 text-sm font-semibold text-text-primary ring-1 ring-border-subtle transition hover:bg-surface-muted active:scale-95"
            >
              Clear cart
            </button>
          </div>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
          <div>
            <p className="text-caption text-text-muted">Cart total</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">₹{total}</p>
          </div>
          <div>
            <p className="text-caption text-text-muted">Booking type</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Multi-service</p>
          </div>
          <div>
            <p className="text-caption text-text-muted">Payment</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">After service</p>
          </div>
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

        <section className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Confirm your service address</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              One address is used for every service in this checkout.
            </p>
          </div>
          <textarea
            name="address"
            required
            placeholder="House/Flat, street, landmark"
            className="min-h-28 w-full rounded-ui bg-surface-muted px-3 py-2 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
          />
          <input
            name="region"
            placeholder="Zone/Region (optional)"
            className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
          />
        </section>

        <section className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Step 2</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Schedule the visit</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Dispatch will use this window for the full cart.
            </p>
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
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
                <span className="inline-flex h-11 items-center rounded-full bg-surface-muted px-4 text-sm font-semibold text-text-secondary ring-1 ring-border-subtle transition peer-checked:bg-brand-primary peer-checked:text-text-inverse peer-checked:ring-brand-primary active:scale-95">
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
                <span className="flex h-11 items-center justify-center rounded-ui bg-surface-muted text-sm font-semibold text-text-secondary ring-1 ring-border-subtle transition peer-checked:bg-brand-primary peer-checked:text-text-inverse peer-checked:ring-brand-primary active:scale-95">
                  {slot}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Step 3</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Add notes and confirm</h2>
          </div>
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            className="min-h-24 w-full rounded-ui bg-surface-muted px-3 py-2 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
          />
          <button className="hidden w-full rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95 md:block">
            Place booking (COD)
          </button>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-surface-elevated/95 p-4 shadow-card backdrop-blur md:hidden">
          <button className="w-full rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse shadow-button-primary transition active:scale-95">
            Place booking · ₹{total}
          </button>
        </div>
      </form>

      <aside className="md:col-span-5">
        <div className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle md:sticky md:top-[76px]">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Receipt</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Cart summary</h2>
          </div>
          <div className="space-y-3">
            <div className="rounded-ui bg-surface-muted p-4 ring-1 ring-border-subtle">
              <p className="text-sm font-semibold text-text-primary">
                {count} item{count === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-caption text-text-muted">
                Booked as separate service jobs from one checkout.
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-semibold text-text-primary">₹{total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Taxes</span>
              <span className="font-semibold text-text-primary">₹0</span>
            </div>
            <div className="h-px bg-border-subtle" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Total</span>
              <span className="text-xl font-semibold text-text-primary">₹{total}</span>
            </div>
          </div>
          <p className="text-caption text-text-muted">Payment: COD / pay after service only.</p>
        </div>
      </aside>
    </div>
  );
}
