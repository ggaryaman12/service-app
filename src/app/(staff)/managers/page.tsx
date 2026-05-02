import { redirect } from "next/navigation";

import { requireAdmin } from "@/features/auth/session.service";
import {
  listManagerAccessRoles,
  listManagers
} from "@/features/operations/manager-access.service";
import {
  OperationsButton,
  OperationsEmptyState,
  OperationsMetricCard,
  OperationsPageHeader,
  OperationsPanel,
  OperationsStatusPill,
  operationsInputClass,
  operationsSelectClass
} from "@/app/(operations)/_components/operations-ui";

import { createManagerAccount, updateManagerAccount } from "../actions";

export default async function ManagersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  const [managers, roles] = await Promise.all([listManagers(), listManagerAccessRoles()]);
  const activeRoles = roles.filter((role) => role.active);
  const assigned = managers.filter((manager) => manager.managerAccessRole).length;

  return (
    <div className="space-y-6">
      <OperationsPageHeader
        eyebrow="Access control"
        title="Managers"
        description="Create manager accounts and assign one active access role to each manager."
      />

      <section className="grid gap-3 md:grid-cols-3">
        <OperationsMetricCard label="Managers" value={managers.length} detail="Manager accounts" tone="accent" />
        <OperationsMetricCard label="Assigned" value={assigned} detail="With access role" tone="success" />
        <OperationsMetricCard label="Active roles" value={activeRoles.length} detail="Assignable profiles" tone="dark" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <OperationsPanel title="Manager assignments" description="Update region and access profile.">
          <div className="overflow-x-auto">
            <table className="min-w-[64rem] w-full text-left text-sm">
              <thead className="bg-[var(--portal-surface-muted)] text-[11px] font-black uppercase tracking-[0.14em] text-[var(--portal-text-muted)]">
                <tr>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Access role</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--portal-border)]">
                {managers.map((manager) => (
                  <tr key={manager.id}>
                    <td className="px-4 py-4">
                      <p className="font-black text-[var(--portal-text)]">{manager.name}</p>
                      <p className="mt-1 text-xs text-[var(--portal-text-muted)]">{manager.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <form id={`manager-${manager.id}`} action={updateManagerAccount} className="contents">
                        <input type="hidden" name="managerId" value={manager.id} />
                        <input
                          name="name"
                          type="hidden"
                          value={manager.name}
                        />
                        <input
                          name="region"
                          defaultValue={manager.region ?? ""}
                          className={`${operationsInputClass} w-44`}
                        />
                      </form>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        form={`manager-${manager.id}`}
                        name="accessRoleId"
                        defaultValue={manager.managerAccessRole?.id ?? ""}
                        className={`${operationsSelectClass} w-56`}
                        required
                      >
                        <option value="" disabled>
                          Select role
                        </option>
                        {activeRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2">
                        <OperationsStatusPill tone={manager.managerAccessRole ? "success" : "warning"}>
                          {manager.managerAccessRole?.name ?? "No role"}
                        </OperationsStatusPill>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <OperationsButton form={`manager-${manager.id}`}>Save</OperationsButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {managers.length === 0 ? <OperationsEmptyState>No managers yet.</OperationsEmptyState> : null}
          </div>
        </OperationsPanel>

        <OperationsPanel title="Create manager" description="Managers must receive one active role.">
          <form action={createManagerAccount} className="grid gap-4 p-4">
            <input name="name" placeholder="Manager name" className={operationsInputClass} required />
            <input name="email" type="email" placeholder="manager@example.com" className={operationsInputClass} required />
            <input name="password" type="password" placeholder="Temporary password" className={operationsInputClass} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="phone" placeholder="Phone" className={operationsInputClass} />
              <input name="region" placeholder="Gandhi Nagar" className={operationsInputClass} />
            </div>
            <select name="accessRoleId" defaultValue="" className={operationsSelectClass} required>
              <option value="" disabled>
                Select access role
              </option>
              {activeRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <OperationsButton tone="accent">Create manager</OperationsButton>
          </form>
        </OperationsPanel>
      </section>
    </div>
  );
}
