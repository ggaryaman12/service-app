import { deleteCategory, updateCategory } from "@/features/admin/admin.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireFeaturePermission("catalog.edit");
    const { id } = await params;
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(
      await updateCategory({
        id,
        name: body?.name,
        slug: body?.slug,
        image: body?.image,
        active: body?.active
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireFeaturePermission("catalog.edit");
    const { id } = await params;
    return jsonOk(await deleteCategory(id));
  } catch (error) {
    return jsonError(error);
  }
}
