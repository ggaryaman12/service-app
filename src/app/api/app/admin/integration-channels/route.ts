import {
  createIntegrationChannel,
  listIntegrationChannels
} from "@/features/integrations/integration-channel.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listIntegrationChannels());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
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
