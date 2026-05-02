import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TransitionLink } from "@/components/route-transition";
import { createBooking } from "../actions";
import { getCatalogServiceDetail } from "@/features/catalog/catalog.service";

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

  const service = await getCatalogServiceDetail(serviceId);
  if (!service) redirect("/services");
  if (session?.user && session.user.role !== "CUSTOMER") redirect("/");

  if (!session?.user) {
    const next = `/book/${service.id}`;
    return (
      <div className="mx-auto w-full max-w-2xl">
        <section className="overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle">
          <div className="bg-brand-primary-muted px-5 py-4">
            <p className="text-caption font-semibold text-brand-primary">Ready to book</p>
            <h1 className="mt-1 text-heading-3 text-text-primary">{service.name}</h1>
            <p className="mt-1 text-body-sm text-text-secondary">{service.category.name}</p>
          </div>
          <div className="space-y-4 p-5">
            <p className="text-body-sm text-text-secondary">
              Sign in to choose your address, preferred slot, and confirm this service with pay after service.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-ui bg-surface-muted p-3">
                <p className="text-caption text-text-muted">Estimated visit</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {service.estimatedMinutes} mins
                </p>
              </div>
              <div className="rounded-ui bg-surface-muted p-3">
                <p className="text-caption text-text-muted">Amount due</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">₹{service.basePrice}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <TransitionLink
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
                href={`/customer/login?next=${encodeURIComponent(next)}`}
                transitionLabel="Login"
              >
                Login
              </TransitionLink>
              <TransitionLink
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border-strong bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:bg-surface-muted active:scale-95"
                href={`/customer/register?next=${encodeURIComponent(next)}`}
                transitionLabel="Register"
              >
                Register
              </TransitionLink>
            </div>
          </div>
        </section>
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
    <div className="grid gap-5 pb-24 md:grid-cols-12 md:pb-0">
      <section className="overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle md:col-span-12">
        <div className="bg-brand-primary-muted px-5 py-4">
          <p className="text-caption font-semibold text-brand-primary">Single service checkout</p>
          <div>
            <h1 className="mt-1 text-heading-3 text-text-primary md:text-heading-2">
              {service.name}
            </h1>
            <p className="mt-2 text-body-sm text-text-secondary">
              {service.category.name} service, confirmed with cash on delivery after the visit.
            </p>
          </div>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
          <div>
            <p className="text-caption text-text-muted">Professional visit</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Verified team</p>
          </div>
          <div>
            <p className="text-caption text-text-muted">Estimated time</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {service.estimatedMinutes} mins
            </p>
          </div>
          <div>
            <p className="text-caption text-text-muted">Payment</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Pay after service</p>
          </div>
        </div>
      </section>

      <form action={createBooking} className="space-y-5 md:col-span-7">
        <input type="hidden" name="serviceId" value={service.id} />

        <section className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Where should we arrive?</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Add a clear address so dispatch can assign the right professional.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-label text-text-primary" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              required
              placeholder="House/Flat, street, landmark"
              className="min-h-28 w-full rounded-ui bg-surface-muted px-3 py-2 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
            />
          </div>
          <div className="space-y-1">
            <label className="text-label text-text-primary" htmlFor="region">
              Zone/Region
            </label>
            <input
              id="region"
              name="region"
              placeholder="e.g. Gandhi Nagar"
              className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Step 2</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Pick your service window</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Choose the earliest slot that works for your home.
            </p>
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
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
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Confirm and pay later</h2>
          </div>
          <div className="rounded-ui bg-brand-secondary-muted p-4 ring-1 ring-border-subtle">
            <p className="text-sm font-semibold text-text-primary">Cash on Delivery / Pay After Service</p>
            <p className="mt-1 text-body-sm text-text-secondary">No online payment is collected here.</p>
          </div>

          <div className="space-y-1">
            <label className="text-label text-text-primary" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Anything the technician should know"
              className="min-h-24 w-full rounded-ui bg-surface-muted px-3 py-2 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
            />
          </div>
          <button className="hidden w-full rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95 md:block">
            Place booking (COD)
          </button>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-surface-elevated/95 p-4 shadow-card backdrop-blur md:hidden">
          <button className="w-full rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse shadow-button-primary transition active:scale-95">
            Place booking · ₹{service.basePrice}
          </button>
        </div>
      </form>

      <aside className="md:col-span-5">
        <div className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle md:sticky md:top-[76px]">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Receipt</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Service summary</h2>
          </div>
          <div className="rounded-ui bg-surface-muted p-4 ring-1 ring-border-subtle">
            <p className="text-sm font-semibold text-text-primary">{service.name}</p>
            <p className="mt-1 text-caption text-text-muted">{service.category.name}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-semibold text-text-primary">₹{service.basePrice}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Visiting charge</span>
              <span className="font-semibold text-text-primary">₹0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Taxes</span>
              <span className="font-semibold text-text-primary">₹0</span>
            </div>
            <div className="h-px bg-border-subtle" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Total</span>
              <span className="text-xl font-semibold text-text-primary">₹{service.basePrice}</span>
            </div>
          </div>
          <p className="text-caption text-text-muted">
            Payment method: COD / pay after service only.
          </p>
        </div>
      </aside>
    </div>
  );
}
