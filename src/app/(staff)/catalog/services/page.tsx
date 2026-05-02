import { createService, deleteService, updateService } from "@/app/(admin)/admin/actions";
import {
  AdminActionButton,
  AdminPageHeader,
  DataPanel,
  EmptyState,
  FieldShell,
  MetricCard,
  StatusPill,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  formatCurrency
} from "@/app/(admin)/admin/_components/admin-ui";
import { CloudinaryUploadField } from "@/components/cloudinary-upload-field";
import { hasAccessPermission } from "@/features/operations/operations-access";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";
import { columnExists } from "@/lib/db-meta";
import { prisma } from "@/lib/prisma";

export default async function AdminServicesPage() {
  const { access } = await requireFeaturePermission("catalog.view");
  const canEdit = hasAccessPermission(access, "catalog.edit");
  const hasServiceImage = await columnExists("Service", "image");

  const [categories, services] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({
      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        basePrice: true,
        estimatedMinutes: true,
        ...(hasServiceImage ? { image: true } : {}),
        category: { select: { name: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
    })
  ]);

  const totalBookings = services.reduce((sum, service) => sum + service._count.bookings, 0);
  const averagePrice =
    services.length > 0
      ? Math.round(services.reduce((sum, service) => sum + service.basePrice, 0) / services.length)
      : 0;
  const activeCategoryIds = new Set(services.map((service) => service.categoryId));

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Services"
        description="Maintain the customer-facing service catalog, prices, media, and operational timing from a focused operations workspace."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Services"
          value={services.length}
          detail={`${activeCategoryIds.size} categories currently used`}
          tone="blue"
        />
        <MetricCard
          label="Avg. price"
          value={formatCurrency(averagePrice)}
          detail="Across all published service rows"
          tone="green"
        />
        <MetricCard
          label="Booked"
          value={totalBookings}
          detail="Total bookings attached to services"
          tone="amber"
        />
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <DataPanel
          title="Service workspace"
          description="Edit service details, pricing, timing, and media in structured rows built for scanning."
        >
          <div className="divide-y divide-[#f0e9dc]">
            {services.map((service) => (
              <form
                key={service.id}
                action={canEdit ? updateService : undefined}
                className="group p-4 transition-colors hover:bg-[#fffaf0] lg:p-5"
              >
                <input type="hidden" name="id" value={service.id} />

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ui-sm bg-[#191816] text-sm font-black uppercase text-[#f3b43f] shadow-[0_14px_30px_rgba(25,24,22,0.16)]">
                      {service.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-[#191816]">{service.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <StatusPill tone="neutral">{service.category.name}</StatusPill>
                        <StatusPill tone="green">{formatCurrency(service.basePrice)}</StatusPill>
                        <StatusPill tone="blue">{service.estimatedMinutes} min</StatusPill>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <span className="inline-flex items-center rounded-full bg-[#f3efe7] px-3 py-1 text-xs font-black text-[#5f574c] ring-1 ring-[#ded5c6]">
                      {service._count.bookings} bookings
                    </span>
                    {canEdit ? (
                      <>
                        <AdminActionButton>Save changes</AdminActionButton>
                        <AdminActionButton tone="light" formAction={deleteService}>
                          Delete
                        </AdminActionButton>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(12rem,1.15fr)_minmax(11rem,0.85fr)_9rem_8rem]">
                  <FieldShell label="Service">
                    <input
                      name="name"
                      defaultValue={service.name}
                      className={adminInputClass}
                      readOnly={!canEdit}
                      required
                    />
                  </FieldShell>
                  <FieldShell label="Category">
                    <select
                      name="categoryId"
                      className={adminSelectClass}
                      required
                      defaultValue={service.categoryId}
                      disabled={!canEdit}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                  <FieldShell label="Price">
                    <input
                      name="basePrice"
                      type="number"
                      min={0}
                      defaultValue={service.basePrice}
                      className={adminInputClass}
                      readOnly={!canEdit}
                      required
                    />
                  </FieldShell>
                  <FieldShell label="Minutes">
                    <input
                      name="estimatedMinutes"
                      type="number"
                      min={1}
                      defaultValue={service.estimatedMinutes}
                      className={adminInputClass}
                      readOnly={!canEdit}
                      required
                    />
                  </FieldShell>
                </div>

                <div
                  className={[
                    "mt-3 grid gap-3",
                    hasServiceImage ? "xl:grid-cols-[minmax(16rem,1.2fr)_minmax(16rem,1fr)]" : ""
                  ].join(" ")}
                >
                  <FieldShell label="Description">
                    <textarea
                      name="description"
                      defaultValue={service.description}
                      className={adminTextareaClass}
                      readOnly={!canEdit}
                      required
                    />
                  </FieldShell>
                  {hasServiceImage && canEdit ? (
                    <div className="rounded-ui-sm bg-[#fbfaf6] p-3 ring-1 ring-[#eee6d8]">
                      <CloudinaryUploadField
                        name="image"
                        label="Service image"
                        defaultValue={
                          "image" in service ? (service as { image?: string | null }).image ?? "" : ""
                        }
                        resourceType="image"
                        folder="jammuserve/services"
                      />
                    </div>
                  ) : null}
                </div>
              </form>
            ))}
            {services.length === 0 ? <EmptyState>No services yet.</EmptyState> : null}
          </div>
        </DataPanel>

        <DataPanel
          title={canEdit ? "Create service" : "Catalog permissions"}
          description={
            canEdit
              ? "Publish a new service offering."
              : "This access role can view catalog data but cannot modify service records."
          }
          className="2xl:sticky 2xl:top-7"
        >
          {canEdit ? (
          <form action={createService} className="grid gap-4 p-4">
            <div className="rounded-ui-sm bg-[#191816] p-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f3b43f]">
                Service setup
              </p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Keep pricing in rupees and use timing that dispatch teams can actually schedule.
              </p>
            </div>
            <FieldShell label="Category">
              <select name="categoryId" className={adminSelectClass} required defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Name">
              <input name="name" placeholder="AC repair" className={adminInputClass} required />
            </FieldShell>
            {hasServiceImage ? (
              <div className="rounded-ui-sm bg-[#fbfaf6] p-3 ring-1 ring-[#eee6d8]">
                <CloudinaryUploadField
                  name="image"
                  label="Service image"
                  resourceType="image"
                  folder="jammuserve/services"
                />
              </div>
            ) : null}
            <FieldShell label="Description">
              <textarea
                name="description"
                placeholder="What the service includes"
                className={adminTextareaClass}
                required
              />
            </FieldShell>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldShell label="Base price">
                <input
                  name="basePrice"
                  type="number"
                  min={0}
                  placeholder="899"
                  className={adminInputClass}
                  required
                />
              </FieldShell>
              <FieldShell label="Minutes">
                <input
                  name="estimatedMinutes"
                  type="number"
                  min={1}
                  placeholder="60"
                  className={adminInputClass}
                  required
                />
              </FieldShell>
            </div>
            <AdminActionButton>Create service</AdminActionButton>
          </form>
          ) : (
            <div className="p-4 text-sm font-semibold leading-6 text-[#7a7268]">
              Ask an admin to assign catalog edit access before publishing or changing services.
            </div>
          )}
        </DataPanel>
      </div>
    </div>
  );
}
