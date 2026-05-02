import {
  getManagerBookings,
  updateBookingStatusAsManager
} from "@/features/bookings/booking.service";
import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  assertAccessPermission,
  resolveAllowedRegion,
  resolveOperationsAccess,
  type OperationsAccess
} from "@/features/operations/operations-access";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type UpdateStatusRequest = {
  bookingId?: string;
  status?: string;
};

type ManagerBooking = Awaited<ReturnType<typeof getManagerBookings>>[number];

function serializeBookingForAccess(booking: ManagerBooking, access: OperationsAccess) {
  return {
    ...booking,
    customer: access.canViewCustomerContact
      ? booking.customer
      : {
          name: booking.customer.name,
          region: booking.customer.region
        },
    totalAmount: access.canViewFinancials ? booking.totalAmount : null
  };
}

export async function GET(request: Request) {
  try {
    const viewer = await requireStaffFeatureUser();
    const access = resolveOperationsAccess(viewer);
    assertAccessPermission(access, "bookings.view");
    const url = new URL(request.url);
    const region = resolveAllowedRegion(access, url.searchParams.get("region"));
    const bookings = await getManagerBookings(region);
    return jsonOk(bookings.map((booking) => serializeBookingForAccess(booking, access)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const viewer = await requireStaffFeatureUser();
    const access = resolveOperationsAccess(viewer);
    assertAccessPermission(access, "bookings.statusOverride");
    const body = await readJson<UpdateStatusRequest>(request);
    return jsonOk(
      await updateBookingStatusAsManager({
        bookingId: body?.bookingId ?? "",
        status: body?.status ?? "",
        managerId: viewer.id,
        allowedRegion: resolveAllowedRegion(access)
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
