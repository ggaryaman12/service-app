import { setIntegrationChannelActive } from "@/features/integrations/integration-channel.service";
import { requireAdmin } from "@/features/auth/session.service";
import { AppError } from "@/features/shared/errors";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await readJson<{ active?: boolean }>(request);
    if (typeof body?.active !== "boolean") {
      throw new AppError("VALIDATION_ERROR", "Active must be a boolean", 400);
    }
    return jsonOk(await setIntegrationChannelActive(id, body.active));
  } catch (error) {
    return jsonError(error);
  }
}
