import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assignWorker, updateBookingStatus } from "@/app/manager/actions";
import { BookingStatus } from "@prisma/client";

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

export default async function ManagerBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      worker: true,
      service: { include: { category: true } },
      media: true,
      review: true
    }
  });

  if (!booking) notFound();

  const availableWorkers = await prisma.workerProfile.findMany({
    where: { isOnline: true, user: { role: "WORKER" } },
    include: { user: true },
    orderBy: [{ user: { name: "asc" } }]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm text-neutral-600">Booking</p>
          <h2 className="truncate text-lg font-semibold">
            {booking.service.category.name} · {booking.service.name}
          </h2>
        </div>
        <Link className="text-sm text-neutral-700 hover:underline" href="/manager/bookings">
          Back
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4 text-sm">
          <p className="text-xs text-neutral-500">Customer</p>
          <p className="font-medium">{booking.customer.name}</p>
          <p className="text-xs text-neutral-600">{booking.customer.email}</p>
          <p className="mt-2 text-xs text-neutral-500">Address</p>
          <p className="text-sm text-neutral-800 whitespace-pre-wrap">{booking.address}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 text-sm">
          <p className="text-xs text-neutral-500">Schedule</p>
          <p className="font-medium">
            {booking.scheduledDate.toISOString().slice(0, 10)} · {booking.scheduledTimeSlot}
          </p>
          <p className="mt-2 text-xs text-neutral-500">Amount</p>
          <p className="font-medium">₹{booking.totalAmount} (COD)</p>
          <p className="mt-2 text-xs text-neutral-500">Status</p>
          <form action={updateBookingStatus} className="mt-1 flex items-center gap-2">
            <input type="hidden" name="bookingId" value={booking.id} />
            <select
              name="status"
              defaultValue={booking.status}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
              Update
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 p-4">
        <h3 className="text-sm font-semibold">Dispatch</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Assign an available online worker (updates status to CONFIRMED).
        </p>
        <form action={assignWorker} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="bookingId" value={booking.id} />
          <select
            name="workerId"
            defaultValue={booking.workerId ?? ""}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm sm:w-96"
            required
          >
            <option value="" disabled>
              Select worker
            </option>
            {availableWorkers.map((w) => (
              <option key={w.userId} value={w.userId}>
                {w.user.name} {w.user.region ? `(${w.user.region})` : ""}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
            Assign
          </button>
        </form>
      </section>
    </div>
  );
}
