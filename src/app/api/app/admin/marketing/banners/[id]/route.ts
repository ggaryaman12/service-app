import { deleteBanner, updateBanner } from "@/features/marketing/marketing.service";
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
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(
      await updateBanner({
        id,
        title: body?.title,
        subtitle: body?.subtitle,
        tone: body?.tone,
        imageUrl: body?.imageUrl,
        href: body?.href,
        active: body?.active,
        sortOrder: body?.sortOrder
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return jsonOk(await deleteBanner(id));
  } catch (error) {
    return jsonError(error);
  }
}
