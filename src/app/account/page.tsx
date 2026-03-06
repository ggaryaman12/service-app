import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TrustBadge } from "@/components/trust-badge";

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
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:col-span-4 md:sticky md:top-[76px] md:self-start">
        <p className="text-xs font-semibold text-slate-500">Account</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
        <p className="mt-2 text-xs text-slate-500">
          Region: <span className="text-slate-700">{user.region ?? "—"}</span> · Phone:{" "}
          <span className="text-slate-700">{user.phone ?? "—"}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <TrustBadge tone="blue" label="COD only" />
          <TrustBadge tone="green" label="Verified pros" />
        </div>
        <div className="mt-4">
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
            href="/services"
          >
            Book a service
          </Link>
        </div>
      </div>

      <div className="md:col-span-8 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">My bookings</h1>
          <span className="text-sm text-slate-500">{bookings.length} total</span>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Recent</p>
          <p className="mt-1 text-xs text-slate-500">
            Track status updates here. Dispatch assigns a professional.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {bookings.map((b) => (
            <div
              key={b.id}
              className={[
                "p-4",
                highlighted === b.id ? "bg-amber-50" : ""
              ].join(" ")}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">{b.service.category.name}</p>
                    <p className="truncate text-sm font-semibold text-slate-900">{b.service.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {b.scheduledDate.toISOString().slice(0, 10)} · {b.scheduledTimeSlot} · ₹
                      {b.totalAmount} (COD)
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {b.status}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">Status timeline</p>
                  <div className="mt-3 space-y-2">
                    {statusSteps(b.status).map((s) => (
                      <div key={s.key} className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className={[
                            "h-5 w-5 rounded-full ring-1 flex items-center justify-center",
                            s.done ? "bg-green-600 ring-green-600" : "bg-white ring-slate-300"
                          ].join(" ")}
                        >
                          {s.done ? (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                              <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                            </svg>
                          ) : null}
                        </span>
                        <span className={["text-sm", s.done ? "text-slate-900" : "text-slate-500"].join(" ")}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-700">
                    Professional: <span className="font-semibold">{b.worker?.name ?? "Unassigned"}</span>
                  </p>
                  {b.worker?.phone ? (
                    <div className="flex gap-2">
                      <a
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-transform active:scale-95"
                        href={`tel:${b.worker.phone}`}
                      >
                        Call
                      </a>
                      <a
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
                        href={`https://wa.me/${b.worker.phone.replace(/\\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ) : null}
                </div>

                <p className="text-[11px] text-slate-500">
                  Booking ID: <span className="font-mono">{b.id}</span>
                </p>
              </div>
            </div>
          ))}
          {bookings.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">
              No bookings yet. Browse{" "}
              <Link className="underline" href="/services">
                services
              </Link>
              .
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
}
