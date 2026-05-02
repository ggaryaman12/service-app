import { getManagerBooking } from "@/features/bookings/booking.service";
import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  assertAccessPermission,
  resolveAllowedRegion,
  resolveOperationsAccess
} from "@/features/operations/operations-access";
import { AppError } from "@/features/shared/errors";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const viewer = await requireStaffFeatureUser();
    const access = resolveOperationsAccess(viewer);
    assertAccessPermission(access, "bookings.view");
    const { id } = await params;
    const booking = await getManagerBooking(id);
    if (!booking) throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
    const region = resolveAllowedRegion(access);
    if (!access.canViewAllRegions && booking.customer.region !== region) {
      throw new AppError("FORBIDDEN", "Forbidden", 403);
    }
    return jsonOk({
      ...booking,
      customer: access.canViewCustomerContact
        ? booking.customer
        : {
            name: booking.customer.name,
            region: booking.customer.region
          },
      totalAmount: access.canViewFinancials ? booking.totalAmount : null
    });
  } catch (error) {
    return jsonError(error);
  }
}
