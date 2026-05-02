import { BookingStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TransitionLink } from "@/components/route-transition";
import { prisma } from "@/lib/prisma";

import { updateJobStatus } from "../../actions";
import {
  formatCurrency,
  OperationsButton,
  OperationsPageHeader,
  OperationsPanel,
  OperationsStatusPill,
  statusTone
} from "../../../_components/operations-ui";

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
    select: {
      id: true,
      status: true,
      scheduledTimeSlot: true,
      totalAmount: true,
      address: true,
      workerId: true,
      customer: { select: { name: true } },
      service: { select: { name: true, category: { select: { name: true } } } }
    }
  });
  if (!booking) notFound();
  if (booking.workerId !== me.id) notFound();

  const nextActions: Array<{ label: string; status: BookingStatus; tone: "accent" | "dark" }> = [];
  if (booking.status === "CONFIRMED") {
    nextActions.push({ label: "Mark En-route", status: "EN_ROUTE", tone: "accent" });
  }
  if (booking.status === "EN_ROUTE") {
    nextActions.push({ label: "Start Job", status: "IN_PROGRESS", tone: "accent" });
  }
  if (booking.status === "IN_PROGRESS") {
    nextActions.push({ label: "Complete Job", status: "COMPLETED", tone: "dark" });
  }

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow="Worker job"
        title={`${booking.service.category.name} · ${booking.service.name}`}
        description="Open the visit, confirm customer context, and move the job through the allowed worker flow."
        actions={
          <TransitionLink
            className="inline-flex min-h-10 items-center rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 text-sm font-black text-[var(--portal-text)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--portal-surface-muted)]"
            href="/worker"
            transitionLabel="Worker"
          >
            Back to jobs
          </TransitionLink>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <OperationsPanel
          title="Visit card"
          description="Customer and address details for the assigned field visit."
          dark
        >
          <div className="grid gap-4 p-4">
            <div className="rounded-ui bg-white/7 p-4">
              <p className="text-xs font-bold text-white/58">Customer</p>
              <p className="mt-2 text-2xl font-black">{booking.customer.name}</p>
            </div>
            <div className="rounded-ui bg-white/7 p-4">
              <p className="text-xs font-bold text-white/58">Slot</p>
              <p className="mt-2 text-2xl font-black">{booking.scheduledTimeSlot}</p>
              <p className="mt-1 text-xs text-white/58">
                {formatCurrency(booking.totalAmount)} · COD
              </p>
            </div>
            <div className="rounded-ui bg-white/7 p-4">
              <p className="text-xs font-bold text-white/58">Status</p>
              <div className="mt-2">
                <OperationsStatusPill tone={statusTone(booking.status)}>
                  {booking.status.replaceAll("_", " ")}
                </OperationsStatusPill>
              </div>
            </div>
          </div>
        </OperationsPanel>

        <OperationsPanel
          title="Job execution"
          description="Only the next allowed worker transition is shown."
        >
          <div className="grid gap-4 p-4">
            <div className="rounded-ui bg-[var(--portal-surface-muted)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                Address
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--portal-text)]">
                {booking.address}
              </p>
            </div>

            <div className="rounded-ui border border-[var(--portal-border)] p-4">
              <h3 className="text-sm font-black text-[var(--portal-text)]">Actions</h3>
              <p className="mt-1 text-xs text-[var(--portal-text-muted)]">
                Move the job through the state machine when the field state changes.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {nextActions.map((action) => (
                  <form key={action.status} action={updateJobStatus}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value={action.status} />
                    <OperationsButton
                      tone={action.tone === "accent" ? "accent" : "dark"}
                      className="w-full"
                    >
                      {action.label}
                    </OperationsButton>
                  </form>
                ))}
                {nextActions.length === 0 ? (
                  <p className="text-sm text-[var(--portal-text-muted)] sm:col-span-3">
                    No actions available for the current status.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </OperationsPanel>
      </section>
    </div>
  );
}
