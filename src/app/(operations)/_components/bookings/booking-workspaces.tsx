import { BookingStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { TransitionLink } from "@/components/route-transition";
import {
  getDispatchSnapshot,
  getManagerBooking,
  getManagerBookings
} from "@/features/bookings/booking.service";
import {
  resolveAllowedRegion,
  resolveOperationsAccess,
  type OperationsAccess,
  type OperationsViewer
} from "@/features/operations/operations-access";

import { assignWorker, updateBookingStatus } from "../../_actions/booking-actions";
import {
  formatCurrency,
  formatDate,
  operationsInputClass,
  operationsSelectClass,
  OperationsButton,
  OperationsEmptyState,
  OperationsMetricCard,
  OperationsPageHeader,
  OperationsPanel,
  OperationsStatusPill,
  statusTone
} from "../operations-ui";

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

function workspaceBasePath(access: OperationsAccess) {
  return "";
}

function regionScopeLabel(access: OperationsAccess, requestedRegion?: string | null) {
  if (access.canViewAllRegions) return requestedRegion ? `Filtered to ${requestedRegion}` : "All regions";
  return access.lockedRegion ? `Locked to ${access.lockedRegion}` : "No manager region assigned";
}

function RegionScopeControl({
  access,
  requestedRegion,
  label = "Region"
}: {
  access: OperationsAccess;
  requestedRegion?: string | null;
  label?: string;
}) {
  if (access.canViewAllRegions) {
    return (
      <form className="grid gap-3 border-b border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-4 py-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
            {label} filter
          </span>
          <input
            name="region"
            defaultValue={requestedRegion ?? ""}
            placeholder="e.g. Gandhi Nagar"
            className={operationsInputClass}
          />
        </label>
        <OperationsButton tone="light">Apply filter</OperationsButton>
      </form>
    );
  }

  return (
    <div className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-4 py-4">
      <div className="rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 py-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
          Region scope
        </p>
        <p className="mt-1 text-sm font-black text-[var(--portal-text)]">
          {access.lockedRegion ?? "Region access required"}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--portal-text-muted)]">
          Manager workspaces are limited to the manager region configured on the user profile.
        </p>
      </div>
    </div>
  );
}

function CustomerSubline({
  email,
  region,
  access
}: {
  email?: string | null;
  region?: string | null;
  access: OperationsAccess;
}) {
  const parts = [
    access.canViewCustomerContact ? email : "Contact restricted",
    access.canViewCustomerRegion ? region ?? "No region" : null
  ].filter(Boolean);

  return <p className="mt-1 text-xs text-[var(--portal-text-muted)]">{parts.join(" · ")}</p>;
}

function StatusUpdateForm({
  bookingId,
  currentStatus
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  return (
    <form action={updateBookingStatus} className="flex justify-end gap-2">
      <input type="hidden" name="bookingId" value={bookingId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className={[operationsSelectClass, "min-h-10 w-40"].join(" ")}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <OperationsButton>Update</OperationsButton>
    </form>
  );
}

export async function BookingListWorkspace({
  viewer,
  requestedRegion
}: {
  viewer: OperationsViewer;
  requestedRegion?: string | null;
}) {
  const access = resolveOperationsAccess(viewer);
  const region = resolveAllowedRegion(access, requestedRegion);
  const bookings = await getManagerBookings(region);
  const basePath = workspaceBasePath(access);
  const pending = bookings.filter((booking) => booking.status === "PENDING").length;
  const assigned = bookings.filter((booking) => Boolean(booking.worker)).length;
  const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const value = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow={access.title}
        title="Bookings"
        description="A shared operations workspace for admins and managers, with customer fields, region scope, and controls gated by role permissions."
        actions={
          <TransitionLink
            href={`${basePath}/dispatch`}
            transitionLabel="Dispatch"
            className="inline-flex min-h-10 items-center rounded-ui-sm bg-[var(--portal-accent)] px-4 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--portal-accent-strong)]"
          >
            Dispatch screen
          </TransitionLink>
        }
      />

      <section className="grid gap-3 md:grid-cols-4">
        <OperationsMetricCard
          label="Showing"
          value={bookings.length}
          detail={regionScopeLabel(access, requestedRegion)}
          tone="accent"
        />
        <OperationsMetricCard
          label="Pending"
          value={pending}
          detail="Awaiting dispatch action"
          tone="warning"
        />
        <OperationsMetricCard
          label="Assigned"
          value={assigned}
          detail="Bookings with workers"
          tone="dark"
        />
        <OperationsMetricCard
          label="Booked value"
          value={access.canViewFinancials ? formatCurrency(value) : "Restricted"}
          detail={`${completed} completed visits`}
          tone="success"
        />
      </section>

      <OperationsPanel
        title="Booking workspace"
        description="The same booking table powers admin and manager workflows; visible fields are controlled by access policy."
      >
        <RegionScopeControl access={access} requestedRegion={requestedRegion} />

        <div className="overflow-x-auto">
          <table className="min-w-[62rem] w-full text-left text-sm">
            <thead className="bg-[var(--portal-surface-muted)] text-[11px] font-black uppercase tracking-[0.14em] text-[var(--portal-text-muted)]">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--portal-border)]">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="transition-colors hover:bg-[var(--portal-surface-muted)]"
                >
                  <td className="px-4 py-4">
                    <TransitionLink
                      className="font-black text-[var(--portal-text)] hover:text-[var(--portal-accent-text)]"
                      href={`${basePath}/bookings/${booking.id}`}
                      transitionLabel="Booking detail"
                    >
                      {booking.service.name}
                    </TransitionLink>
                    <p className="mt-1 text-xs text-[var(--portal-text-muted)]">
                      {booking.service.category.name} ·{" "}
                      {access.canViewFinancials ? formatCurrency(booking.totalAmount) : "Restricted"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-[var(--portal-text)]">{booking.customer.name}</p>
                    <CustomerSubline
                      email={booking.customer.email}
                      region={booking.customer.region}
                      access={access}
                    />
                  </td>
                  <td className="px-4 py-4 text-[var(--portal-text-muted)]">
                    {formatDate(booking.scheduledDate)}
                    <p className="mt-1 text-xs">{booking.scheduledTimeSlot}</p>
                  </td>
                  <td className="px-4 py-4 text-[var(--portal-text-muted)]">
                    {booking.worker?.name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-4">
                    <OperationsStatusPill tone={statusTone(booking.status)}>
                      {booking.status.replaceAll("_", " ")}
                    </OperationsStatusPill>
                  </td>
                  <td className="px-4 py-4">
                    {access.canOverrideAnyStatus ? (
                      <StatusUpdateForm bookingId={booking.id} currentStatus={booking.status} />
                    ) : (
                      <div className="flex justify-end">
                        <TransitionLink
                          href={`${basePath}/bookings/${booking.id}`}
                          transitionLabel="Booking detail"
                          className="inline-flex min-h-10 items-center rounded-ui-sm border border-[var(--portal-border)] px-4 text-sm font-black text-[var(--portal-text)]"
                        >
                          Review
                        </TransitionLink>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 ? (
            <OperationsEmptyState>No bookings found for this access scope.</OperationsEmptyState>
          ) : null}
        </div>
      </OperationsPanel>
    </div>
  );
}

export async function DispatchWorkspace({
  viewer,
  requestedRegion
}: {
  viewer: OperationsViewer;
  requestedRegion?: string | null;
}) {
  const access = resolveOperationsAccess(viewer);
  const region = resolveAllowedRegion(access, requestedRegion);
  const [pendingBookings, availableWorkers] = await getDispatchSnapshot(region);
  const queueValue = pendingBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const basePath = workspaceBasePath(access);

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow={access.title}
        title="Dispatch screen"
        description="A shared assignment queue for admins and managers. Region scope and assignment controls are resolved from the signed-in role."
        actions={
          <TransitionLink
            className="inline-flex min-h-10 items-center rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 text-sm font-black text-[var(--portal-text)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--portal-surface-muted)]"
            href={`${basePath}/bookings`}
            transitionLabel="Bookings"
          >
            View all bookings
          </TransitionLink>
        }
      />

      <section className="grid gap-3 md:grid-cols-3">
        <OperationsMetricCard
          label="Pending bookings"
          value={pendingBookings.length}
          detail={regionScopeLabel(access, requestedRegion)}
          tone="warning"
        />
        <OperationsMetricCard
          label="Online workers"
          value={availableWorkers.length}
          detail="Ready for assignment"
          tone="accent"
        />
        <OperationsMetricCard
          label="Queue value"
          value={access.canViewFinancials ? formatCurrency(queueValue) : "Restricted"}
          detail="COD value waiting dispatch"
          tone="success"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <OperationsPanel
          title="Assignment queue"
          description="Pending service requests sorted by schedule."
        >
          <RegionScopeControl access={access} requestedRegion={requestedRegion} label="Region" />

          <div className="divide-y divide-[var(--portal-border)]">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-[var(--portal-surface-muted)] xl:grid-cols-[1fr_22rem]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-[var(--portal-text)]">
                      {booking.service.category.name} · {booking.service.name}
                    </p>
                    <OperationsStatusPill tone="warning">Pending</OperationsStatusPill>
                  </div>
                  <p className="mt-1 text-xs text-[var(--portal-text-muted)]">
                    {formatDate(booking.scheduledDate)} · {booking.scheduledTimeSlot} ·{" "}
                    {access.canViewFinancials ? formatCurrency(booking.totalAmount) : "Restricted"}
                  </p>
                  <p className="mt-2 text-sm font-bold text-[var(--portal-text)]">
                    {booking.customer.name}
                    {access.canViewCustomerRegion ? (
                      <span className="font-medium text-[var(--portal-text-muted)]">
                        {" "}
                        · {booking.customer.region ?? "No region"}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-[var(--portal-text-muted)]">
                    {booking.address}
                  </p>
                </div>

                {access.canAssignWorkers ? (
                  <form action={assignWorker} className="flex w-full flex-col gap-2 sm:w-auto">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <select
                      name="workerId"
                      defaultValue=""
                      className={operationsSelectClass}
                      required
                    >
                      <option value="" disabled>
                        Assign worker
                      </option>
                      {availableWorkers.map((worker) => (
                        <option key={worker.userId} value={worker.userId}>
                          {worker.user.name} {worker.user.region ? `(${worker.user.region})` : ""}
                        </option>
                      ))}
                    </select>
                    <OperationsButton tone="accent">Assign & confirm</OperationsButton>
                  </form>
                ) : (
                  <div className="rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3 text-sm font-bold text-[var(--portal-text-muted)]">
                    Assignment restricted for this role.
                  </div>
                )}
              </div>
            ))}
            {pendingBookings.length === 0 ? (
              <OperationsEmptyState>No pending bookings in this access scope.</OperationsEmptyState>
            ) : null}
          </div>
        </OperationsPanel>

        <OperationsPanel
          title="Available workers"
          description="Online workers eligible for assignment."
          dark
        >
          <div className="divide-y divide-white/10">
            {availableWorkers.map((worker) => (
              <div key={worker.userId} className="flex items-center justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{worker.user.name}</p>
                  <p className="mt-1 text-xs text-white/58">
                    {worker.user.region ?? "No region set"}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
                  Online
                </span>
              </div>
            ))}
            {availableWorkers.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-white/58">
                No workers are online for this scope.
              </div>
            ) : null}
          </div>
        </OperationsPanel>
      </section>
    </div>
  );
}

export async function BookingDetailWorkspace({
  viewer,
  bookingId
}: {
  viewer: OperationsViewer;
  bookingId: string;
}) {
  const access = resolveOperationsAccess(viewer);
  const region = resolveAllowedRegion(access);
  const booking = await getManagerBooking(bookingId);
  if (!booking) notFound();
  if (!access.canViewAllRegions && booking.customer.region !== region) notFound();

  const [, availableWorkers] = await getDispatchSnapshot(region);
  const basePath = workspaceBasePath(access);

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow="Booking detail"
        title={`${booking.service.category.name} · ${booking.service.name}`}
        description="The same booking detail workspace is reused for admin and manager roles, with customer data and controls resolved from access policy."
        actions={
          <TransitionLink
            className="inline-flex min-h-10 items-center rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 text-sm font-black text-[var(--portal-text)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--portal-surface-muted)]"
            href={`${basePath}/bookings`}
            transitionLabel="Bookings"
          >
            Back to bookings
          </TransitionLink>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <OperationsPanel
          title="Customer and schedule"
          description="Customer context needed before changing assignment or state."
        >
          <div className="grid gap-4 p-4">
            <div className="rounded-ui bg-[var(--portal-surface-muted)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                Customer
              </p>
              <p className="mt-2 text-lg font-black text-[var(--portal-text)]">
                {booking.customer.name}
              </p>
              <CustomerSubline
                email={booking.customer.email}
                region={booking.customer.region}
                access={access}
              />
            </div>
            <div className="rounded-ui bg-[var(--portal-surface-muted)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                Schedule
              </p>
              <p className="mt-2 text-sm font-black text-[var(--portal-text)]">
                {formatDate(booking.scheduledDate)} · {booking.scheduledTimeSlot}
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--portal-text-muted)]">
                {access.canViewFinancials ? formatCurrency(booking.totalAmount) : "Restricted"} · COD
              </p>
            </div>
            <div className="rounded-ui bg-[var(--portal-surface-muted)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                Address
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--portal-text)]">
                {booking.address}
              </p>
            </div>
          </div>
        </OperationsPanel>

        <OperationsPanel
          title="Operational controls"
          description="Status and worker assignment actions are permission-gated by the shared access policy."
        >
          <div className="grid gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-ui bg-[var(--portal-surface-muted)] p-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                  Current status
                </p>
                <div className="mt-2">
                  <OperationsStatusPill tone={statusTone(booking.status)}>
                    {booking.status.replaceAll("_", " ")}
                  </OperationsStatusPill>
                </div>
              </div>
              {access.canOverrideAnyStatus ? (
                <StatusUpdateForm bookingId={booking.id} currentStatus={booking.status} />
              ) : null}
            </div>

            <div className="rounded-ui border border-[var(--portal-border)] p-4">
              <h3 className="text-sm font-black text-[var(--portal-text)]">Dispatch assignment</h3>
              <p className="mt-1 text-xs text-[var(--portal-text-muted)]">
                Assignment confirms the booking and revalidates admin, manager, worker, and customer views.
              </p>
              {access.canAssignWorkers ? (
                <form action={assignWorker} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <select
                    name="workerId"
                    defaultValue={booking.workerId ?? ""}
                    className={operationsSelectClass}
                    required
                  >
                    <option value="" disabled>
                      Select worker
                    </option>
                    {availableWorkers.map((worker) => (
                      <option key={worker.userId} value={worker.userId}>
                        {worker.user.name} {worker.user.region ? `(${worker.user.region})` : ""}
                      </option>
                    ))}
                  </select>
                  <OperationsButton tone="accent">Assign worker</OperationsButton>
                </form>
              ) : (
                <div className="mt-4 rounded-ui-sm bg-[var(--portal-surface-muted)] px-3 py-3 text-sm font-bold text-[var(--portal-text-muted)]">
                  Assignment is restricted for this role.
                </div>
              )}
            </div>
          </div>
        </OperationsPanel>
      </section>
    </div>
  );
}
