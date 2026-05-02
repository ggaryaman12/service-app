import { redirect } from "next/navigation";

import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  hasAccessPermission,
  resolveOperationsAccess
} from "@/features/operations/operations-access";
import { DispatchWorkspace } from "@/app/(operations)/_components/bookings/booking-workspaces";

export default async function DispatchPage({
  searchParams
}: {
  searchParams?: Promise<{ region?: string }>;
}) {
  const viewer = await requireStaffFeatureUser();
  const access = resolveOperationsAccess(viewer);
  if (!hasAccessPermission(access, "dispatch.view")) redirect("/");
  const { region } = (await searchParams) ?? {};

  return <DispatchWorkspace viewer={viewer} requestedRegion={region} />;
}
