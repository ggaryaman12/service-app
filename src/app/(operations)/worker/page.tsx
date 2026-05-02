import { auth } from "@/auth";
import { TransitionLink } from "@/components/route-transition";
import { getWorkerJobs } from "@/features/bookings/booking.service";
import { prisma } from "@/lib/prisma";

import { toggleDuty } from "./actions";
import {
  OperationsButton,
  OperationsMetricCard,
  OperationsPageHeader,
  OperationsPanel,
  OperationsStatusPill,
  statusTone
} from "../_components/operations-ui";

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
  const online = Boolean(me.workerProfile?.isOnline);
  const inProgress = jobs.filter((job) => job.status === "IN_PROGRESS").length;
  const enRoute = jobs.filter((job) => job.status === "EN_ROUTE").length;

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow="Worker workspace"
        title="Field execution console"
        description="See today's assigned jobs, update duty readiness, and move visits forward from the field."
        actions={
          <form action={toggleDuty}>
            <OperationsButton tone={online ? "light" : "accent"}>
              {online ? "Go offline" : "Go online"}
            </OperationsButton>
          </form>
        }
      />

      <section className="grid gap-3 md:grid-cols-4">
        <OperationsMetricCard
          label="Duty state"
          value={online ? "Online" : "Offline"}
          detail={me.name ?? "Worker account"}
          tone={online ? "success" : "dark"}
        />
        <OperationsMetricCard
          label="Jobs today"
          value={jobs.length}
          detail="Assigned active visits"
          tone="accent"
        />
        <OperationsMetricCard
          label="En-route"
          value={enRoute}
          detail="Customer visits being approached"
          tone="dark"
        />
        <OperationsMetricCard
          label="In progress"
          value={inProgress}
          detail="Service work currently underway"
          tone="warning"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <OperationsPanel
          title="Field status"
          description="Worker readiness and current route posture."
          dark
        >
          <div className="grid gap-4 p-4">
            <div className="rounded-ui bg-white/7 p-4">
              <p className="text-xs font-bold text-white/58">Assigned worker</p>
              <p className="mt-2 text-2xl font-black">{me.name ?? "Worker"}</p>
              <p className="mt-1 text-xs text-white/58">{email}</p>
            </div>
            <div className="rounded-ui bg-white/7 p-4">
              <p className="text-xs font-bold text-white/58">Duty</p>
              <p className="mt-2 text-4xl font-black">{online ? "Live" : "Paused"}</p>
              <p className="mt-1 text-xs text-white/58">
                {online ? "Ready for assignment" : "Not visible in dispatch"}
              </p>
            </div>
          </div>
        </OperationsPanel>

        <OperationsPanel
          title="Active jobs"
          description="Today's assigned jobs. Open one to update the customer visit."
        >
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {jobs.map((job) => (
              <TransitionLink
                key={job.id}
                href={`/worker/job/${job.id}`}
                transitionLabel={job.service.name}
                className="group rounded-ui border border-[var(--portal-border)] bg-[var(--portal-surface-muted)] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--portal-surface)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-accent-text)]">
                      {job.service.category.name}
                    </p>
                    <p className="mt-2 truncate text-lg font-black text-[var(--portal-text)]">
                      {job.service.name}
                    </p>
                  </div>
                  <OperationsStatusPill tone={statusTone(job.status)}>
                    {job.status.replaceAll("_", " ")}
                  </OperationsStatusPill>
                </div>
                <p className="mt-3 text-sm font-bold text-[var(--portal-text)]">
                  {job.scheduledTimeSlot}
                </p>
                <p className="mt-1 text-xs text-[var(--portal-text-muted)]">
                  Customer: {job.customer.name}
                </p>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--portal-text-muted)]">
                  {job.address}
                </p>
              </TransitionLink>
            ))}
            {jobs.length === 0 ? (
              <div className="rounded-ui border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-muted)] p-8 text-center text-sm font-medium text-[var(--portal-text-muted)] md:col-span-2">
                No active jobs assigned for today.
              </div>
            ) : null}
          </div>
        </OperationsPanel>
      </section>
    </div>
  );
}
