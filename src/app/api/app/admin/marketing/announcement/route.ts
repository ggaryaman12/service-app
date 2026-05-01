import { updateAnnouncement } from "@/features/marketing/marketing.service";
import { requireAdmin } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await readJson<Record<string, unknown>>(request);
    return jsonOk(await updateAnnouncement(body ?? {}));
  } catch (error) {
    return jsonError(error);
  }
}
