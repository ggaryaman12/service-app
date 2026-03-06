import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [totalBookings, activeWorkers] = await Promise.all([
    prisma.booking.count(),
    prisma.workerProfile.count({ where: { isOnline: true } })
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Total bookings</p>
          <p className="text-2xl font-semibold">{totalBookings}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Active workers</p>
          <p className="text-2xl font-semibold">{activeWorkers}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          className="rounded-lg border border-neutral-200 p-4 text-sm hover:border-neutral-300"
          href="/admin/categories"
        >
          Categories
        </Link>
        <Link
          className="rounded-lg border border-neutral-200 p-4 text-sm hover:border-neutral-300"
          href="/admin/services"
        >
          Services
        </Link>
        <Link
          className="rounded-lg border border-neutral-200 p-4 text-sm hover:border-neutral-300"
          href="/admin/marketing"
        >
          Marketing
        </Link>
        <Link
          className="rounded-lg border border-neutral-200 p-4 text-sm hover:border-neutral-300"
          href="/admin/users"
        >
          Users
        </Link>
      </div>
    </div>
  );
}
