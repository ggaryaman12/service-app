import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function statusSteps(status: string) {
  const steps = [
    { key: "CONFIRMED", label: "Booking Confirmed" },
    { key: "ASSIGNED", label: "Professional Assigned" },
    { key: "EN_ROUTE", label: "En-route" },
    { key: "IN_PROGRESS", label: "Service Started" },
    { key: "COMPLETED", label: "Completed" }
  ] as const;

  const assigned = status !== "PENDING";
  const normalized = assigned ? status : "CONFIRMED";

  return steps.map((s) => {
    if (s.key === "ASSIGNED") {
      return { ...s, done: assigned };
    }
    const order: Record<string, number> = {
      CONFIRMED: 1,
      EN_ROUTE: 3,
      IN_PROGRESS: 4,
      COMPLETED: 5,
      CANCELLED: 99,
      PENDING: 0
    };
    const done = order[normalized] >= order[s.key];
    return { ...s, done };
  });
}

export default async function AccountPage({
  searchParams
}: {
  searchParams?: Promise<{ new?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/customer/login?next=/account");
  if (session.user.role !== "CUSTOMER") redirect("/");

  const sp = (await searchParams) ?? {};

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, region: true, phone: true }
  });
  if (!user) redirect("/customer/login?next=/account");

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    include: { service: { include: { category: true } }, worker: true },
    orderBy: [{ scheduledDate: "desc" }],
    take: 50
  });

  const highlighted = sp.new ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle md:col-span-4 md:sticky md:top-[76px] md:self-start">
        <div className="bg-brand-primary-muted px-5 py-4">
          <p className="text-caption font-semibold text-brand-primary">Account</p>
          <h1 className="mt-1 text-heading-3 text-text-primary">{user.name}</h1>
          <p className="mt-1 text-body-sm text-text-secondary">{user.email}</p>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-3">
            <div className="rounded-ui bg-surface-muted p-3">
              <p className="text-caption text-text-muted">Region</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{user.region ?? "Not added"}</p>
            </div>
            <div className="rounded-ui bg-surface-muted p-3">
              <p className="text-caption text-text-muted">Phone</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{user.phone ?? "Not added"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-secondary-muted px-3 py-1 text-caption font-semibold text-state-info">
              COD only
            </span>
            <span className="rounded-full bg-brand-primary-muted px-3 py-1 text-caption font-semibold text-brand-primary">
              Verified pros
            </span>
          </div>
          <Link
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
            href="/services"
          >
            Book a service
          </Link>
        </div>
      </div>

      <div className="md:col-span-8 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Bookings</p>
            <h2 className="mt-1 text-heading-3 text-text-primary">My service timeline</h2>
          </div>
          <span className="shrink-0 rounded-full bg-surface-muted px-3 py-1 text-caption font-semibold text-text-secondary">
            {bookings.length} total
          </span>
        </div>

        <div className="overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle">
          <div className="border-b border-border-subtle px-5 py-4">
            <p className="text-sm font-semibold text-text-primary">Recent</p>
            <p className="mt-1 text-body-sm text-text-secondary">
              Track status updates here. Dispatch assigns a professional after confirmation.
            </p>
          </div>
          <div className="divide-y divide-border-subtle">
            {bookings.map((b) => (
              <article
                key={b.id}
                className={[
                  "p-5",
                  highlighted === b.id ? "bg-brand-secondary-muted" : "bg-surface-elevated"
                ].join(" ")}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-caption font-semibold text-brand-primary">{b.service.category.name}</p>
                      <p className="truncate text-base font-semibold text-text-primary">{b.service.name}</p>
                      <p className="mt-1 text-caption text-text-muted">
                        {b.scheduledDate.toISOString().slice(0, 10)} · {b.scheduledTimeSlot} · ₹
                        {b.totalAmount} (COD)
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-caption font-semibold text-text-secondary ring-1 ring-border-subtle">
                      {b.status}
                    </span>
                  </div>

                  <div className="rounded-ui bg-surface-muted p-4 ring-1 ring-border-subtle">
                    <p className="text-caption font-semibold text-text-muted">Status timeline</p>
                    <div className="mt-3 space-y-2">
                      {statusSteps(b.status).map((s) => (
                        <div key={s.key} className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className={[
                              "flex h-5 w-5 items-center justify-center rounded-full ring-1",
                              s.done ? "bg-state-success ring-state-success" : "bg-surface-elevated ring-border-strong"
                            ].join(" ")}
                          >
                            {s.done ? (
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-text-inverse">
                                <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                              </svg>
                            ) : null}
                          </span>
                          <span className={["text-sm", s.done ? "text-text-primary" : "text-text-muted"].join(" ")}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-text-secondary">
                      Professional: <span className="font-semibold">{b.worker?.name ?? "Unassigned"}</span>
                    </p>
                    {b.worker?.phone ? (
                      <div className="flex gap-2">
                        <a
                          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-surface-elevated px-4 text-sm font-semibold text-text-primary ring-1 ring-border-subtle transition hover:bg-surface-muted active:scale-95"
                          href={`tel:${b.worker.phone}`}
                        >
                          Call
                        </a>
                        <a
                          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
                          href={`https://wa.me/${b.worker.phone.replace(/\\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <p className="text-caption-small text-text-muted">
                    Booking ID: <span className="font-mono">{b.id}</span>
                  </p>
                </div>
              </article>
            ))}
            {bookings.length === 0 ? (
              <div className="p-5">
                <p className="text-sm font-semibold text-text-primary">No bookings yet</p>
                <p className="mt-1 text-body-sm text-text-secondary">
                  Choose a service and your first booking will appear here with live status updates.
                </p>
                <Link
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95 sm:w-auto"
                  href="/services"
                >
                  Browse services
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
