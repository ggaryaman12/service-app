import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold">Create category</h2>
        <form action={createCategory} className="mt-3 grid gap-3 sm:grid-cols-4">
          <input
            name="name"
            placeholder="Name"
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="slug"
            placeholder="Slug (e.g. ac-repair)"
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="image"
            placeholder="Image URL (optional)"
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
            <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
              Create
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Categories</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {categories.map((c) => (
            <div key={c.id} className="p-4">
              <form action={updateCategory} className="grid gap-3 sm:grid-cols-6">
                <input type="hidden" name="id" value={c.id} />
                <input
                  name="name"
                  defaultValue={c.name}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  required
                />
                <input
                  name="slug"
                  defaultValue={c.slug}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  required
                />
                <input
                  name="image"
                  defaultValue={c.image ?? ""}
                  placeholder="Image URL"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="active" defaultChecked={c.active} />
                  Active
                </label>
                <div className="flex items-center gap-2">
                  <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
                    Save
                  </button>
                  <button
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-900"
                    formAction={deleteCategory}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          ))}
          {categories.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">No categories yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
