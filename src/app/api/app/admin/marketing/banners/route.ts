import { createBanner } from "@/features/marketing/marketing.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireFeaturePermission("marketing.manage");
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(
      await createBanner({
        title: body?.title,
        subtitle: body?.subtitle,
        tone: body?.tone,
        imageUrl: body?.imageUrl,
        href: body?.href,
        active: body?.active,
        sortOrder: body?.sortOrder
      }),
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
