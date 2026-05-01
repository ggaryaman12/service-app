import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toggleDuty } from "@/app/worker/actions";
import { getWorkerJobs } from "@/features/bookings/booking.service";

export default async function WorkerDashboardPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  const me = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      workerProfile: true
    }
  });
  if (!me) return null;

  const jobs = await getWorkerJobs(me.id);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Status</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{me.name}</p>
            <p className="text-xs text-slate-500">
              Duty:{" "}
              <span className="font-semibold text-slate-700">
                {me.workerProfile?.isOnline ? "Online" : "Offline"}
              </span>
            </p>
          </div>
          <form action={toggleDuty}>
            <button className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95">
              Toggle duty
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Active jobs (today)</h2>
          <span className="text-sm text-slate-500">{jobs.length}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((j) => (
            <Link
              key={j.id}
              href={`/worker/job/${j.id}`}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-transform active:scale-[0.99]"
            >
              <p className="text-xs font-semibold text-slate-500">{j.service.category.name}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{j.service.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {j.scheduledTimeSlot} · Status: <span className="font-semibold">{j.status}</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Customer: <span className="text-slate-700">{j.customer.name}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{j.address}</p>
            </Link>
          ))}
          {jobs.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 md:col-span-2">
              No active jobs assigned for today.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
