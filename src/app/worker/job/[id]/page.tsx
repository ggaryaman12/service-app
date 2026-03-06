import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateJobStatus } from "@/app/worker/actions";
import { BookingStatus } from "@prisma/client";

export default async function WorkerJobPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) return null;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { customer: true, service: { include: { category: true } } }
  });
  if (!booking) notFound();
  if (booking.workerId !== me.id) notFound();

  const nextActions: Array<{ label: string; status: BookingStatus; tone: "blue" | "green" }> = [];
  if (booking.status === "CONFIRMED") nextActions.push({ label: "Mark En-route", status: "EN_ROUTE", tone: "blue" });
  if (booking.status === "EN_ROUTE") nextActions.push({ label: "Start Job", status: "IN_PROGRESS", tone: "blue" });
  if (booking.status === "IN_PROGRESS") nextActions.push({ label: "Complete Job", status: "COMPLETED", tone: "green" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">Job</p>
          <h2 className="truncate text-lg font-semibold text-slate-900">
            {booking.service.category.name} · {booking.service.name}
          </h2>
        </div>
        <Link className="text-sm font-medium text-slate-600 hover:underline" href="/worker">
          Back
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-2">
        <p className="text-xs font-semibold text-slate-500">Customer</p>
        <p className="text-sm font-semibold text-slate-900">{booking.customer.name}</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{booking.address}</p>
        <p className="mt-2 text-xs text-slate-500">
          Slot: {booking.scheduledTimeSlot} · Amount: ₹{booking.totalAmount} (COD) · Status:{" "}
          <span className="font-semibold">{booking.status}</span>
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Actions</h3>
        <p className="mt-1 text-xs text-slate-500">
          Move the job through the state machine.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {nextActions.map((a) => (
            <form key={a.status} action={updateJobStatus}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="status" value={a.status} />
              <button
                className={[
                  "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95",
                  a.tone === "green" ? "bg-green-600" : "bg-blue-600"
                ].join(" ")}
              >
                {a.label}
              </button>
            </form>
          ))}
          {nextActions.length === 0 ? (
            <p className="text-sm text-slate-500 sm:col-span-3">No actions available.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

