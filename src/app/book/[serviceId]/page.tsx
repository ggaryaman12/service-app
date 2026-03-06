import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBooking } from "@/app/book/actions";
import { TrustBadge } from "@/components/trust-badge";

const DEFAULT_SLOTS = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
  "19:00 - 21:00"
] as const;

export default async function BookServicePage({
  params
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const session = await auth();
  const { serviceId } = await params;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { category: true }
  });
  if (!service) redirect("/services");
  if (session?.user && session.user.role !== "CUSTOMER") redirect("/");

  if (!session?.user) {
    const next = `/book/${service.id}`;
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Book service</h1>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">{service.category.name}</p>
          <p className="mt-1 text-sm font-semibold">{service.name}</p>
          <p className="mt-2 text-sm text-neutral-600">Please login or register to continue.</p>
          <div className="mt-3 flex gap-2">
            <Link
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
              href={`/customer/login?next=${encodeURIComponent(next)}`}
            >
              Login
            </Link>
            <Link
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              href={`/customer/register?next=${encodeURIComponent(next)}`}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="grid gap-5 md:grid-cols-12">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:col-span-12">
        <p className="text-xs font-semibold text-slate-500">Checkout</p>
        <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              {service.category.name} · {service.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Estimated time: {service.estimatedMinutes} mins
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrustBadge tone="blue" label="COD only" />
            <TrustBadge tone="green" label="Verified professionals" />
          </div>
        </div>
      </section>

      <form action={createBooking} className="space-y-5 md:col-span-7">
        <input type="hidden" name="serviceId" value={service.id} />

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Step 1</p>
            <h2 className="text-sm font-semibold text-slate-900">Location</h2>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              required
              placeholder="House/Flat, street, landmark"
              className="min-h-24 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="region">
              Zone/Region
            </label>
            <input
              id="region"
              name="region"
              placeholder="e.g. Gandhi Nagar"
              className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Step 2</p>
            <h2 className="text-sm font-semibold text-slate-900">Slot selection</h2>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {dateOptions.map((d) => (
              <label
                key={d.value}
                className="shrink-0"
              >
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
            <h2 className="text-sm font-semibold text-slate-900">Payment</h2>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">Cash on Delivery / Pay After Service</p>
            <p className="mt-1 text-sm text-slate-500">No online payments. Pay after the job is done.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Anything the technician should know"
              className="min-h-20 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
            />
          </div>
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
              <span className="font-semibold text-slate-900">₹{service.basePrice}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Visiting charge</span>
              <span className="font-semibold text-slate-900">₹0</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Taxes</span>
              <span className="font-semibold text-slate-900">₹0</span>
            </div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="text-lg font-semibold text-slate-900">₹{service.basePrice}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Payment method: COD / pay after service only.
          </p>
        </div>
      </aside>
    </div>
  );
}
