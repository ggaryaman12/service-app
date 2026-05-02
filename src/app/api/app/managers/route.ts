import {
  createManager,
  listManagers
} from "@/features/operations/manager-access.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type CreateManagerRequest = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  region?: string;
  accessRoleId?: string;
};

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listManagers());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await readJson<CreateManagerRequest>(request);
    const manager = await createManager({
      name: body?.name,
      email: body?.email,
      password: body?.password,
      phone: body?.phone,
      region: body?.region,
      accessRoleId: body?.accessRoleId
    });
    return jsonOk(manager, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
