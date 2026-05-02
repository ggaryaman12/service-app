import { updateManagerAccessRole } from "@/features/operations/manager-access.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type UpdateRoleRequest = {
  name?: string;
  description?: string;
  permissions?: string[];
  active?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const [{ id }, body] = await Promise.all([params, readJson<UpdateRoleRequest>(request)]);
    return jsonOk(
      await updateManagerAccessRole({
        id,
        name: body?.name,
        description: body?.description,
        permissions: body?.permissions,
        active: body?.active
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
