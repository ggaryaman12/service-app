import {
  getManagerBookings,
  updateBookingStatusAsManager
} from "@/features/bookings/booking.service";
import { requireManager } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type UpdateStatusRequest = {
  bookingId?: string;
  status?: string;
};

export async function GET(request: Request) {
  try {
    await requireManager();
    const url = new URL(request.url);
    return jsonOk(await getManagerBookings(url.searchParams.get("region")));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireManager();
    const body = await readJson<UpdateStatusRequest>(request);
    return jsonOk(
      await updateBookingStatusAsManager({
        bookingId: body?.bookingId ?? "",
        status: body?.status ?? "",
        managerId: user.id
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
