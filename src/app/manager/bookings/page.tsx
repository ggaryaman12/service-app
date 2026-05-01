import Link from "next/link";
import { getManagerBookings } from "@/features/bookings/booking.service";
import { updateBookingStatus } from "@/app/manager/actions";
import { BookingStatus } from "@prisma/client";

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

export default async function ManagerBookingsPage({
  searchParams
}: {
  searchParams?: Promise<{ region?: string }>;
}) {
  const { region } = (await searchParams) ?? {};

  const bookings = await getManagerBookings(region);

  return (
    <div className="space-y-4">
      <form className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="text-sm text-neutral-700">
          Region filter (matches customer.region)
        </label>
        <input
          name="region"
          defaultValue={region ?? ""}
          placeholder="e.g. Gandhi Nagar"
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm sm:w-72"
        />
        <button className="rounded-md border border-neutral-200 px-3 py-2 text-sm">
          Apply
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Bookings</h2>
          <p className="mt-1 text-xs text-neutral-500">Showing latest 50.</p>
        </div>
        <div className="divide-y divide-neutral-200">
          {bookings.map((b) => (
            <div key={b.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">
                    <Link className="hover:underline" href={`/manager/bookings/${b.id}`}>
                      {b.service.category.name} · {b.service.name}
                    </Link>
                  </p>
                  <p className="text-xs text-neutral-600">
                    {b.scheduledDate.toISOString().slice(0, 10)} · {b.scheduledTimeSlot} · ₹
                    {b.totalAmount}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Customer: {b.customer.name} ({b.customer.email}) · region:{" "}
                    {b.customer.region ?? "—"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Worker: {b.worker?.name ?? "unassigned"}
                  </p>
                </div>

                <form action={updateBookingStatus} className="flex items-center gap-2">
                  <input type="hidden" name="bookingId" value={b.id} />
                  <select
                    name="status"
                    defaultValue={b.status}
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
            </div>
          ))}
          {bookings.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">No bookings found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
