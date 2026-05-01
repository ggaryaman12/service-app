import { rotateIntegrationChannelKey } from "@/features/integrations/integration-channel.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return jsonOk(await rotateIntegrationChannelKey(id));
  } catch (error) {
    return jsonError(error);
  }
}
