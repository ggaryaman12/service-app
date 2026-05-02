import { updateLandingHero } from "@/features/marketing/marketing.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    await requireFeaturePermission("marketing.manage");
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(await updateLandingHero(body ?? {}));
  } catch (error) {
    return jsonError(error);
  }
}
