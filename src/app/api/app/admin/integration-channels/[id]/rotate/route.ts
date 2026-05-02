import { rotateIntegrationChannelKey } from "@/features/integrations/integration-channel.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireFeaturePermission("integrations.manage");
    const { id } = await params;
    return jsonOk(await rotateIntegrationChannelKey(id));
  } catch (error) {
    return jsonError(error);
  }
}
