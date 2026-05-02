import {
  assignWorkerToBooking,
  getDispatchSnapshot
} from "@/features/bookings/booking.service";
import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  assertAccessPermission,
  resolveAllowedRegion,
  resolveOperationsAccess
} from "@/features/operations/operations-access";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type AssignWorkerRequest = {
  bookingId?: string;
  workerId?: string;
};

export async function GET(request: Request) {
  try {
    const viewer = await requireStaffFeatureUser();
    const access = resolveOperationsAccess(viewer);
    assertAccessPermission(access, "dispatch.view");
    const url = new URL(request.url);
    const region = resolveAllowedRegion(access, url.searchParams.get("region"));
    const [pendingBookings, availableWorkers] = await getDispatchSnapshot(region);
    return jsonOk({
      pendingBookings,
      availableWorkers: availableWorkers.map((worker) => ({
        userId: worker.userId,
        isOnline: worker.isOnline,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        user: {
          id: worker.user.id,
          name: worker.user.name,
          region: worker.user.region
        }
      }))
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireStaffFeatureUser();
    const access = resolveOperationsAccess(viewer);
    assertAccessPermission(access, "dispatch.assign");
    const body = await readJson<AssignWorkerRequest>(request);
    return jsonOk(
      await assignWorkerToBooking({
        bookingId: body?.bookingId ?? "",
        workerId: body?.workerId ?? "",
        managerId: viewer.id,
        allowedRegion: resolveAllowedRegion(access)
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
