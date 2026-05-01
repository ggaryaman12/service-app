import {
  assignWorkerToBooking,
  getDispatchSnapshot
} from "@/features/bookings/booking.service";
import { requireManager } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type AssignWorkerRequest = {
  bookingId?: string;
  workerId?: string;
};

export async function GET(request: Request) {
  try {
    await requireManager();
    const url = new URL(request.url);
    const [pendingBookings, availableWorkers] = await getDispatchSnapshot(
      url.searchParams.get("region")
    );
    return jsonOk({ pendingBookings, availableWorkers });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireManager();
    const body = await readJson<AssignWorkerRequest>(request);
    return jsonOk(
      await assignWorkerToBooking({
        bookingId: body?.bookingId ?? "",
        workerId: body?.workerId ?? "",
        managerId: user.id
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
