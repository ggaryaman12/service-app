import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, updateCategory } from "@/app/(admin)/admin/actions";
import {
  AdminActionButton,
  AdminPageHeader,
  DataPanel,
  EmptyState,
  FieldShell,
  MetricCard,
  StatusPill,
  adminInputClass
} from "@/app/(admin)/admin/_components/admin-ui";
import { hasAccessPermission } from "@/features/operations/operations-access";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export default async function AdminCategoriesPage() {
  const { access } = await requireFeaturePermission("catalog.view");
  const canEdit = hasAccessPermission(access, "catalog.edit");
  const categories = await prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { name: "asc" }
  });

  const activeCount = categories.filter((category) => category.active).length;
  const hiddenCount = categories.length - activeCount;
  const mappedServices = categories.reduce((sum, category) => sum + category._count.services, 0);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Organize service discovery with clean category names, slugs, imagery, and live status controls."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Live categories"
          value={`${activeCount}/${categories.length}`}
          detail="Visible on the customer catalog"
          tone="green"
        />
        <MetricCard
          label="Services mapped"
          value={mappedServices}
          detail="Services assigned to categories"
          tone="blue"
        />
        <MetricCard
          label="Hidden"
          value={hiddenCount}
          detail="Draft or paused groupings"
          tone={hiddenCount > 0 ? "amber" : "neutral"}
        />
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <DataPanel
          title="Category workspace"
          description="Edit names, slugs, imagery, and catalog visibility without leaving the list."
        >
          <div className="divide-y divide-[#f0e9dc]">
            {categories.map((category) => (
              <form
                key={category.id}
                action={canEdit ? updateCategory : undefined}
                className="group grid gap-4 p-4 transition-colors hover:bg-[#fffaf0]"
              >
                <input type="hidden" name="id" value={category.id} />

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ui-sm bg-[#191816] text-sm font-black uppercase text-[#f3b43f] shadow-[0_14px_30px_rgba(25,24,22,0.16)]">
                      {category.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-[#191816]">{category.name}</p>
                      <p className="mt-1 truncate font-mono text-xs text-[#7a7268]">/{category.slug}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <StatusPill tone={category.active ? "green" : "neutral"}>
                      {category.active ? "Active" : "Hidden"}
                    </StatusPill>
                    <span className="inline-flex items-center rounded-full bg-[#f3efe7] px-3 py-1 text-xs font-black text-[#5f574c] ring-1 ring-[#ded5c6]">
                      {category._count.services} services
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(12rem,1.25fr)]">
                  <FieldShell label="Name">
                    <input
                      name="name"
                      defaultValue={category.name}
                      className={adminInputClass}
                      readOnly={!canEdit}
                      required
                    />
                  </FieldShell>
                  <FieldShell label="Slug">
                    <input
                      name="slug"
                      defaultValue={category.slug}
                      className={adminInputClass}
                      readOnly={!canEdit}
                      required
                    />
                  </FieldShell>
                  <FieldShell label="Image URL">
                    <input
                      name="image"
                      defaultValue={category.image ?? ""}
                      placeholder="https://..."
                      className={adminInputClass}
                      readOnly={!canEdit}
                    />
                  </FieldShell>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#f0e9dc] pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm font-bold text-[#5f574c]">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={category.active}
                      disabled={!canEdit}
                    />
                    Active on customer catalog
                  </label>
                  {canEdit ? (
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <AdminActionButton>Save changes</AdminActionButton>
                      <AdminActionButton tone="light" formAction={deleteCategory}>
                        Delete
                      </AdminActionButton>
                    </div>
                  ) : null}
                </div>
              </form>
            ))}
            {categories.length === 0 ? <EmptyState>No categories yet.</EmptyState> : null}
          </div>
        </DataPanel>

        <DataPanel
          title={canEdit ? "Create category" : "Catalog permissions"}
          description={
            canEdit
              ? "Add a focused grouping for customers and internal catalog operators."
              : "This access role can view catalog data but cannot modify category records."
          }
          className="2xl:sticky 2xl:top-7"
        >
          {canEdit ? (
          <form action={createCategory} className="grid gap-4 p-4">
            <div className="rounded-ui-sm bg-[#191816] p-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f3b43f]">
                New grouping
              </p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Keep category names short and customer-facing. Slugs should stay stable after publishing.
              </p>
            </div>
            <FieldShell label="Name">
              <input name="name" placeholder="AC repair" className={adminInputClass} required />
            </FieldShell>
            <FieldShell label="Slug">
              <input
                name="slug"
                placeholder="ac-repair"
                className={adminInputClass}
                required
              />
            </FieldShell>
            <FieldShell label="Image URL">
              <input name="image" placeholder="Optional image URL" className={adminInputClass} />
            </FieldShell>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5f574c]">
              <input type="checkbox" name="active" defaultChecked />
              Active on customer catalog
            </label>
            <AdminActionButton>Create category</AdminActionButton>
          </form>
          ) : (
            <div className="p-4 text-sm font-semibold leading-6 text-[#7a7268]">
              Ask an admin to assign catalog edit access before changing service discovery data.
            </div>
          )}
        </DataPanel>
      </div>
    </div>
  );
}
