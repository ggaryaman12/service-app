import Link from "next/link";
import { assignWorker } from "@/app/manager/actions";
import { getDispatchSnapshot } from "@/features/bookings/booking.service";

export default async function ManagerDispatchPage({
  searchParams
}: {
  searchParams?: Promise<{ region?: string }>;
}) {
  const { region } = (await searchParams) ?? {};

  const [pendingBookings, availableWorkers] = await getDispatchSnapshot(region);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm text-neutral-700">Region</label>
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
        <Link className="text-sm text-neutral-700 hover:underline" href="/manager/bookings">
          View all bookings
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Pending bookings</p>
          <p className="text-2xl font-semibold">{pendingBookings.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Available workers (online)</p>
          <p className="text-2xl font-semibold">{availableWorkers.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Dispatch screen</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {pendingBookings.map((b) => (
            <div key={b.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {b.service.category.name} · {b.service.name}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {b.scheduledDate.toISOString().slice(0, 10)} · {b.scheduledTimeSlot} · ₹
                    {b.totalAmount}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Customer: {b.customer.name} · region: {b.customer.region ?? "—"}
                  </p>
                  <p className="text-xs text-neutral-500 whitespace-pre-wrap">
                    {b.address}
                  </p>
                </div>

                <form action={assignWorker} className="flex w-full flex-col gap-2 sm:w-auto">
                  <input type="hidden" name="bookingId" value={b.id} />
                  <select
                    name="workerId"
                    defaultValue=""
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm sm:w-72"
                    required
                  >
                    <option value="" disabled>
                      Assign worker
                    </option>
                    {availableWorkers.map((w) => (
                      <option key={w.userId} value={w.userId}>
                        {w.user.name} {w.user.region ? `(${w.user.region})` : ""}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
                    Assign & confirm
                  </button>
                </form>
              </div>
            </div>
          ))}
          {pendingBookings.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">
              No pending bookings in this filter.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
