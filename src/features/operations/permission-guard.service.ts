import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  assertAccessPermission,
  assertAnyAccessPermission,
  resolveOperationsAccess,
  type AccessPermission
} from "@/features/operations/operations-access";

export async function requireFeaturePermission(permission: AccessPermission) {
  const viewer = await requireStaffFeatureUser();
  const access = resolveOperationsAccess(viewer);
  assertAccessPermission(access, permission);
  return { viewer, access };
}

export async function requireAnyFeaturePermission(permissions: AccessPermission[]) {
  const viewer = await requireStaffFeatureUser();
  const access = resolveOperationsAccess(viewer);
  assertAnyAccessPermission(access, permissions);
  return { viewer, access };
}
