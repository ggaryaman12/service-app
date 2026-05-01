import { createService } from "@/features/admin/admin.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
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
