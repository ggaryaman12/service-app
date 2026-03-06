import { prisma } from "@/lib/prisma";
import { createStaffUser, updateUserRole } from "@/app/admin/actions";
import { Role } from "@prisma/client";

const ROLE_OPTIONS: Role[] = ["ADMIN", "MANAGER", "WORKER", "CUSTOMER"];

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { workerProfile: true }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold">Create manager/worker</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Only admins can create staff accounts. Customers use /register.
        </p>
        <form action={createStaffUser} className="mt-3 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Name"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="password"
              type="password"
              placeholder="Temporary password"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
            />
            <select
              name="role"
              defaultValue="MANAGER"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="MANAGER">MANAGER</option>
              <option value="WORKER">WORKER</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              name="region"
              placeholder="Region (optional) e.g. Gandhi Nagar"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="w-fit rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
            Create staff user
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold">User management</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Change roles. Setting a user to WORKER auto-creates WorkerProfile.
          </p>
        </div>
        <div className="divide-y divide-neutral-200">
          {users.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-neutral-500">
                    {u.name} · region: {u.region ?? "—"} · worker profile:{" "}
                    {u.workerProfile ? "yes" : "no"}
                  </p>
                </div>
                <form action={updateUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={u.id} />
                  <select
                    name="role"
                    defaultValue={u.role}
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
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
          {users.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">No users yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
