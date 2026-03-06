import { prisma } from "@/lib/prisma";
import { createService, deleteService, updateService } from "@/app/admin/actions";
import { CloudinaryUploadField } from "@/components/cloudinary-upload-field";
import { columnExists } from "@/lib/db-meta";

export default async function AdminServicesPage() {
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
        category: { select: { name: true } }
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
    })
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold">Create service</h2>
        <form action={createService} className="mt-3 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="categoryId"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Service name"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <CloudinaryUploadField
            name="image"
            label="Service image (optional)"
            resourceType="image"
            folder="jammuserve/services"
          />
          <textarea
            name="description"
            placeholder="Description"
            className="min-h-24 rounded-md border border-neutral-200 px-3 py-2 text-sm"
            required
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="basePrice"
              type="number"
              min={0}
              placeholder="Base price (₹)"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
            />
            <input
              name="estimatedMinutes"
              type="number"
              min={1}
              placeholder="Estimated minutes"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
              Create
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Services</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {services.map((s) => (
            <div key={s.id} className="p-4">
              <form action={updateService} className="grid gap-3">
                <input type="hidden" name="id" value={s.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    name="categoryId"
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    required
                    defaultValue={s.categoryId}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    name="name"
                    defaultValue={s.name}
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <CloudinaryUploadField
                  name="image"
                  label="Service image (optional)"
                  defaultValue={"image" in s ? (s as { image?: string | null }).image ?? "" : ""}
                  resourceType="image"
                  folder="jammuserve/services"
                />
                <textarea
                  name="description"
                  defaultValue={s.description}
                  className="min-h-24 rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  required
                />
                <div className="grid gap-3 sm:grid-cols-4">
                  <input
                    name="basePrice"
                    type="number"
                    min={0}
                    defaultValue={s.basePrice}
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    name="estimatedMinutes"
                    type="number"
                    min={1}
                    defaultValue={s.estimatedMinutes}
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    required
                  />
                  <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
                    Save
                  </button>
                  <button
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    formAction={deleteService}
                    name="id"
                    value={s.id}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          ))}
          {services.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">No services yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
