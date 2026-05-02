import { listAdminCatalog } from "@/features/admin/admin.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireFeaturePermission("catalog.view");
    return jsonOk(await listAdminCatalog());
  } catch (error) {
    return jsonError(error);
  }
}
