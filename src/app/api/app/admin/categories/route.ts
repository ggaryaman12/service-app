import { createCategory } from "@/features/admin/admin.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(
      await createCategory({
        name: body?.name,
        slug: body?.slug,
        image: body?.image,
        active: body?.active
      }),
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
