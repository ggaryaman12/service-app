import { listAdminCatalog } from "@/features/admin/admin.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listAdminCatalog());
  } catch (error) {
    return jsonError(error);
  }
}
