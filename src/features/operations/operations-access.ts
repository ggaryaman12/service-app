import { Role, type Prisma } from "@prisma/client";

import { AppError } from "@/features/shared/errors";

export const ACCESS_PERMISSIONS = [
  "bookings.view",
  "bookings.customerContact",
  "bookings.allRegions",
  "bookings.financials",
  "bookings.statusOverride",
  "dispatch.view",
  "dispatch.assign",
  "catalog.view",
  "catalog.edit",
  "marketing.manage",
  "integrations.manage"
] as const;

export type AccessPermission = (typeof ACCESS_PERMISSIONS)[number];

export type ManagerAccessRoleSnapshot = {
  id: string;
  name: string;
  permissions: Prisma.JsonValue;
  active: boolean;
} | null;

export type OperationsViewer = {
  id: string;
  email: string;
  name: string;
  role: Role | string;
  region?: string | null;
  managerAccessRole?: ManagerAccessRoleSnapshot;
};

export type OperationsAccess = {
  role: "admin" | "manager";
  title: string;
  permissions: Set<AccessPermission>;
  managerAccessRole: ManagerAccessRoleSnapshot;
  canViewAllRegions: boolean;
  canViewCustomerContact: boolean;
  canViewCustomerRegion: boolean;
  canViewFinancials: boolean;
  canOverrideAnyStatus: boolean;
  canAssignWorkers: boolean;
  lockedRegion: string | null;
};

const permissionSet = new Set<AccessPermission>(ACCESS_PERMISSIONS);
const adminPermissions = new Set<AccessPermission>(ACCESS_PERMISSIONS);

function normalizePermissions(raw: Prisma.JsonValue): Set<AccessPermission> {
  if (!Array.isArray(raw)) return new Set();
  return new Set(
    raw.filter((permission): permission is AccessPermission => {
      return typeof permission === "string" && permissionSet.has(permission as AccessPermission);
    })
  );
}

export function resolveOperationsAccess(viewer: OperationsViewer): OperationsAccess {
  if (viewer.role === Role.ADMIN || viewer.role === "ADMIN") {
    return {
      role: "admin",
      title: "Admin operations",
      permissions: adminPermissions,
      managerAccessRole: null,
      canViewAllRegions: true,
      canViewCustomerContact: true,
      canViewCustomerRegion: true,
      canViewFinancials: true,
      canOverrideAnyStatus: true,
      canAssignWorkers: true,
      lockedRegion: null
    };
  }

  const managerAccessRole = viewer.managerAccessRole?.active ? viewer.managerAccessRole : null;
  const permissions = managerAccessRole
    ? normalizePermissions(managerAccessRole.permissions)
    : new Set<AccessPermission>();

  return {
    role: "manager",
    title: managerAccessRole?.name ?? "Manager workspace",
    permissions,
    managerAccessRole,
    canViewAllRegions: permissions.has("bookings.allRegions"),
    canViewCustomerContact: permissions.has("bookings.customerContact"),
    canViewCustomerRegion: true,
    canViewFinancials: permissions.has("bookings.financials"),
    canOverrideAnyStatus: permissions.has("bookings.statusOverride"),
    canAssignWorkers: permissions.has("dispatch.assign"),
    lockedRegion: viewer.region ?? null
  };
}

export function hasAccessPermission(access: OperationsAccess, permission: AccessPermission) {
  return access.permissions.has(permission);
}

export function assertAccessPermission(access: OperationsAccess, permission: AccessPermission) {
  if (!hasAccessPermission(access, permission)) {
    throw new AppError("FORBIDDEN", "Forbidden", 403);
  }
}

export function assertAnyAccessPermission(
  access: OperationsAccess,
  permissions: AccessPermission[]
) {
  if (!permissions.some((permission) => hasAccessPermission(access, permission))) {
    throw new AppError("FORBIDDEN", "Forbidden", 403);
  }
}

export function resolveAllowedRegion(
  access: OperationsAccess,
  requestedRegion?: string | null
) {
  if (access.canViewAllRegions) return requestedRegion?.trim() || null;
  return access.lockedRegion || "__NO_MANAGER_REGION__";
}

export function serializeAccessPermissions(permissions: Set<AccessPermission>) {
  return ACCESS_PERMISSIONS.filter((permission) => permissions.has(permission));
}
