import { redirect } from "next/navigation";

import { TransitionLink } from "@/components/route-transition";
import { getDispatchSnapshot, getManagerBookings } from "@/features/bookings/booking.service";
import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  hasAccessPermission,
  resolveAllowedRegion,
  resolveOperationsAccess
} from "@/features/operations/operations-access";
import {
  formatCurrency,
  formatDate,
  OperationsMetricCard,
  OperationsPageHeader,
  OperationsPanel,
  OperationsStatusPill,
  statusTone
} from "@/app/(operations)/_components/operations-ui";

export default async function DashboardPage() {
  const viewer = await requireStaffFeatureUser();
  const access = resolveOperationsAccess(viewer);
  if (access.role !== "admin" && access.permissions.size === 0) redirect("/");

  const canViewBookings = hasAccessPermission(access, "bookings.view");
  const canViewDispatch = hasAccessPermission(access, "dispatch.view");
  const region = resolveAllowedRegion(access);
  const [bookings, dispatchSnapshot] = await Promise.all([
    canViewBookings ? getManagerBookings(region) : Promise.resolve([]),
    canViewDispatch ? getDispatchSnapshot(region) : Promise.resolve([[], []] as Awaited<ReturnType<typeof getDispatchSnapshot>>)
  ]);
  const [pendingBookings, availableWorkers] = dispatchSnapshot;
  const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const activeJobs = bookings.filter((booking) =>
    ["CONFIRMED", "EN_ROUTE", "IN_PROGRESS"].includes(booking.status)
  ).length;
  const latestBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow={access.title}
        title="Dashboard"
        description="Role-aware staff overview for bookings, dispatch capacity, and feature access."
        actions={
          <>
            {canViewDispatch ? (
              <TransitionLink
                href="/dispatch"
                transitionLabel="Dispatch"
                className="inline-flex min-h-10 items-center rounded-ui-sm bg-[var(--portal-accent)] px-4 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--portal-accent-strong)]"
              >
                Dispatch screen
              </TransitionLink>
            ) : null}
            {canViewBookings ? (
              <TransitionLink
                href="/bookings"
                transitionLabel="Bookings"
                className="inline-flex min-h-10 items-center rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 text-sm font-black text-[var(--portal-text)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--portal-surface-muted)]"
              >
                Bookings
              </TransitionLink>
            ) : null}
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-4">
        <OperationsMetricCard
          label="Pending queue"
          value={pendingBookings.length}
          detail={access.canViewAllRegions ? "All regions" : access.lockedRegion ?? "Region required"}
          tone="warning"
        />
        <OperationsMetricCard
          label="Online workers"
          value={availableWorkers.length}
          detail="Available dispatch capacity"
          tone="accent"
        />
        <OperationsMetricCard
          label="Active jobs"
          value={activeJobs}
          detail="Confirmed, en-route, or in progress"
          tone="dark"
        />
        <OperationsMetricCard
          label="Managed value"
          value={access.canViewFinancials ? formatCurrency(totalRevenue) : "Restricted"}
          detail={`${completed} completed bookings`}
          tone="success"
        />
      </section>

      <OperationsPanel
        title="Live booking queue"
        description="Latest requests and operational state in your permission scope."
      >
        <div className="divide-y divide-[var(--portal-border)]">
          {latestBookings.map((booking) => (
            <div
              key={booking.id}
              className="grid gap-3 px-4 py-4 transition-colors hover:bg-[var(--portal-surface-muted)] md:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TransitionLink
                    href={`/bookings/${booking.id}`}
                    transitionLabel="Booking detail"
                    className="truncate text-sm font-black text-[var(--portal-text)] hover:text-[var(--portal-accent-text)]"
                  >
                    {booking.service.category.name} · {booking.service.name}
                  </TransitionLink>
                  <OperationsStatusPill tone={statusTone(booking.status)}>
                    {booking.status.replaceAll("_", " ")}
                  </OperationsStatusPill>
                </div>
                <p className="mt-1 text-xs text-[var(--portal-text-muted)]">
                  {formatDate(booking.scheduledDate)} · {booking.scheduledTimeSlot} ·{" "}
                  {booking.customer.name} · worker {booking.worker?.name ?? "unassigned"}
                </p>
              </div>
              <p className="text-sm font-black text-[var(--portal-text)]">
                {access.canViewFinancials ? formatCurrency(booking.totalAmount) : "Restricted"}
              </p>
            </div>
          ))}
          {latestBookings.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--portal-text-muted)]">
              No bookings visible in this access scope.
            </div>
          ) : null}
        </div>
      </OperationsPanel>
    </div>
  );
}
