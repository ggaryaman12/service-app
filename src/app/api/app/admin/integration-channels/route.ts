import {
  createIntegrationChannel,
  listIntegrationChannels
} from "@/features/integrations/integration-channel.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireFeaturePermission("integrations.manage");
    return jsonOk(await listIntegrationChannels());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireFeaturePermission("integrations.manage");
    const body = await readJson<{ name?: string; scopes?: unknown }>(request);
    return jsonOk(
      await createIntegrationChannel({
        name: body?.name ?? "",
        scopes: body?.scopes
      }),
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
