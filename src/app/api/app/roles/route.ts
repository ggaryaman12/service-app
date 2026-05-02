import {
  createManagerAccessRole,
  listManagerAccessRoles
} from "@/features/operations/manager-access.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type CreateRoleRequest = {
  name?: string;
  description?: string;
  permissions?: string[];
};

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listManagerAccessRoles());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await readJson<CreateRoleRequest>(request);
    const role = await createManagerAccessRole({
      name: body?.name,
      description: body?.description,
      permissions: body?.permissions ?? []
    });
    return jsonOk(role, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
