import { redirect } from "next/navigation";

import { requireAdmin } from "@/features/auth/session.service";
import {
  ACCESS_PERMISSIONS,
  type AccessPermission
} from "@/features/operations/operations-access";
import { listManagerAccessRoles } from "@/features/operations/manager-access.service";
import {
  OperationsButton,
  OperationsMetricCard,
  OperationsPageHeader,
  OperationsPanel,
  OperationsStatusPill,
  operationsInputClass
} from "@/app/(operations)/_components/operations-ui";

import { createAccessRole, updateAccessRole } from "../actions";

const permissionLabels: Record<AccessPermission, string> = {
  "bookings.view": "View bookings",
  "bookings.customerContact": "View customer contact",
  "bookings.allRegions": "View all regions",
  "bookings.financials": "View financials",
  "bookings.statusOverride": "Override booking status",
  "dispatch.view": "View dispatch",
  "dispatch.assign": "Assign workers",
  "catalog.view": "View catalog admin",
  "catalog.edit": "Edit catalog",
  "marketing.manage": "Manage marketing",
  "integrations.manage": "Manage integration channels"
};

export default async function RolesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  const roles = await listManagerAccessRoles();
  const activeRoles = roles.filter((role) => role.active).length;

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow="Access control"
        title="Roles"
        description="Create manager access profiles for feature pages, fields, and operational actions."
      />

      <section className="grid gap-3 md:grid-cols-3">
        <OperationsMetricCard label="Access roles" value={roles.length} detail="Total profiles" tone="accent" />
        <OperationsMetricCard label="Active" value={activeRoles} detail="Assignable to managers" tone="success" />
        <OperationsMetricCard
          label="Assigned managers"
          value={roles.reduce((sum, role) => sum + role._count.managers, 0)}
          detail="Managers using profiles"
          tone="dark"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <OperationsPanel title="Role profiles" description="Edit role names, active status, and permission sets.">
          <div className="divide-y divide-[var(--portal-border)]">
            {roles.map((role) => {
              const permissions = Array.isArray(role.permissions)
                ? role.permissions.map(String)
                : [];
              return (
                <form key={role.id} action={updateAccessRole} className="grid gap-4 px-4 py-4">
                  <input type="hidden" name="id" value={role.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto] md:items-start">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                        Name
                      </span>
                      <input name="name" defaultValue={role.name} className={operationsInputClass} required />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                        Description
                      </span>
                      <input
                        name="description"
                        defaultValue={role.description ?? ""}
                        className={operationsInputClass}
                      />
                    </label>
                    <label className="mt-7 flex min-h-11 items-center gap-2 text-sm font-black text-[var(--portal-text)]">
                      <input name="active" type="checkbox" defaultChecked={role.active} />
                      Active
                    </label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {ACCESS_PERMISSIONS.map((permission) => (
                      <label key={permission} className="flex items-center gap-2 rounded-ui-sm border border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-3 py-2 text-sm font-bold">
                        <input
                          name="permissions"
                          type="checkbox"
                          value={permission}
                          defaultChecked={permissions.includes(permission)}
                        />
                        {permissionLabels[permission]}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <OperationsStatusPill tone={role.active ? "success" : "neutral"}>
                      {role.active ? "Active" : "Inactive"}
                    </OperationsStatusPill>
                    <OperationsButton>Save role</OperationsButton>
                  </div>
                </form>
              );
            })}
          </div>
        </OperationsPanel>

        <OperationsPanel title="Create role" description="New roles become assignable after creation.">
          <form action={createAccessRole} className="grid gap-4 p-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                Name
              </span>
              <input name="name" placeholder="Booking desk" className={operationsInputClass} required />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--portal-text-muted)]">
                Description
              </span>
              <input name="description" placeholder="What this profile can do" className={operationsInputClass} />
            </label>
            <div className="grid gap-2">
              {ACCESS_PERMISSIONS.map((permission) => (
                <label key={permission} className="flex items-center gap-2 text-sm font-bold text-[var(--portal-text)]">
                  <input name="permissions" type="checkbox" value={permission} />
                  {permissionLabels[permission]}
                </label>
              ))}
            </div>
            <OperationsButton tone="accent">Create role</OperationsButton>
          </form>
        </OperationsPanel>
      </section>
    </div>
  );
}
