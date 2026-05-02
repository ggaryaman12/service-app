import { createService } from "@/features/admin/admin.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireFeaturePermission("catalog.edit");
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(
      await createService({
        categoryId: body?.categoryId,
        name: body?.name,
        description: body?.description,
        image: body?.image,
        basePrice: body?.basePrice,
        estimatedMinutes: body?.estimatedMinutes
      }),
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
