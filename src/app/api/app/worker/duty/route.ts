import { toggleWorkerDuty } from "@/features/bookings/booking.service";
import { requireWorker } from "@/features/auth/session.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await requireWorker();
    return jsonOk(await toggleWorkerDuty(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
