import { updateUserRole } from "@/features/admin/admin.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await readJson<{ role?: string }>(request);
    return jsonOk(await updateUserRole({ userId: id, role: body?.role ?? "" }));
  } catch (error) {
    return jsonError(error);
  }
}
