import { deleteService, updateService } from "@/features/admin/admin.service";
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
      await updateService({
        id,
        categoryId: body?.categoryId,
        name: body?.name,
        description: body?.description,
        image: body?.image,
        basePrice: body?.basePrice,
        estimatedMinutes: body?.estimatedMinutes
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
    return jsonOk(await deleteService(id));
  } catch (error) {
    return jsonError(error);
  }
}
