import { updateManager } from "@/features/operations/manager-access.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type UpdateManagerRequest = {
  name?: string;
  phone?: string;
  region?: string;
  accessRoleId?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const [{ id }, body] = await Promise.all([params, readJson<UpdateManagerRequest>(request)]);
    return jsonOk(
      await updateManager({
        managerId: id,
        name: body?.name,
        phone: body?.phone,
        region: body?.region,
        accessRoleId: body?.accessRoleId
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
