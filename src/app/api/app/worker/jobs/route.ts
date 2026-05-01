import {
  getWorkerJobs,
  updateAssignedWorkerJobStatus
} from "@/features/bookings/booking.service";
import { requireWorker } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type UpdateJobRequest = {
  bookingId?: string;
  status?: string;
};

export async function GET() {
  try {
    const user = await requireWorker();
    return jsonOk(await getWorkerJobs(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireWorker();
    const body = await readJson<UpdateJobRequest>(request);
    return jsonOk(
      await updateAssignedWorkerJobStatus({
        bookingId: body?.bookingId ?? "",
        workerId: user.id,
        status: body?.status ?? ""
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
