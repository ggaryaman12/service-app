import { Role, type Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  ACCESS_PERMISSIONS,
  type AccessPermission
} from "@/features/operations/operations-access";
import { AppError, assertNonEmpty } from "@/features/shared/errors";

const permissionSet = new Set<string>(ACCESS_PERMISSIONS);

const managerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  region: true,
  role: true,
  createdAt: true,
  managerAccessRole: {
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      active: true
    }
  }
} satisfies Prisma.UserSelect;

const accessRoleSelect = {
  id: true,
  name: true,
  description: true,
  permissions: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { managers: true } }
} satisfies Prisma.ManagerAccessRoleSelect;

function normalizeOptionalText(value: unknown) {
  return String(value ?? "").trim() || null;
}

function parsePermissions(value: unknown): AccessPermission[] {
  if (!Array.isArray(value)) {
    throw new AppError("VALIDATION_ERROR", "Permissions must be an array", 400);
  }

  const permissions = Array.from(
    new Set(
      value.map((permission) => String(permission ?? "").trim()).filter(Boolean)
    )
  );

  const invalid = permissions.filter((permission) => !permissionSet.has(permission));
  if (invalid.length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Invalid permissions: ${invalid.join(", ")}`,
      400
    );
  }

  return permissions as AccessPermission[];
}

async function assertActiveAccessRole(accessRoleId: unknown) {
  const id = assertNonEmpty(accessRoleId, "Access role");
  const role = await prisma.managerAccessRole.findUnique({
    where: { id },
    select: { id: true, active: true }
  });
  if (!role || !role.active) {
    throw new AppError("ACCESS_ROLE_NOT_FOUND", "Active access role not found", 404);
  }
  return role.id;
}

export async function listManagerAccessRoles() {
  return prisma.managerAccessRole.findMany({
    select: accessRoleSelect,
    orderBy: [{ active: "desc" }, { name: "asc" }]
  });
}

export async function createManagerAccessRole(input: {
  name: unknown;
  description?: unknown;
  permissions: unknown;
}) {
  return prisma.managerAccessRole.create({
    data: {
      name: assertNonEmpty(input.name, "Name"),
      description: normalizeOptionalText(input.description),
      permissions: parsePermissions(input.permissions)
    },
    select: accessRoleSelect
  });
}

export async function updateManagerAccessRole(input: {
  id: unknown;
  name?: unknown;
  description?: unknown;
  permissions?: unknown;
  active?: unknown;
}) {
  const id = assertNonEmpty(input.id, "Access role");
  return prisma.managerAccessRole.update({
    where: { id },
    data: {
      ...(input.name === undefined ? {} : { name: assertNonEmpty(input.name, "Name") }),
      ...(input.description === undefined
        ? {}
        : { description: normalizeOptionalText(input.description) }),
      ...(input.permissions === undefined
        ? {}
        : { permissions: parsePermissions(input.permissions) }),
      ...(input.active === undefined ? {} : { active: Boolean(input.active) })
    },
    select: accessRoleSelect
  });
}

export async function listManagers() {
  return prisma.user.findMany({
    where: { role: Role.MANAGER },
    select: managerSelect,
    orderBy: [{ name: "asc" }]
  });
}

export async function createManager(input: {
  name: unknown;
  email: unknown;
  password: unknown;
  phone?: unknown;
  region?: unknown;
  accessRoleId: unknown;
}) {
  const managerAccessRoleId = await assertActiveAccessRole(input.accessRoleId);
  return prisma.user.create({
    data: {
      name: assertNonEmpty(input.name, "Name"),
      email: assertNonEmpty(input.email, "Email").toLowerCase(),
      passwordHash: hashPassword(assertNonEmpty(input.password, "Password")),
      phone: normalizeOptionalText(input.phone),
      region: normalizeOptionalText(input.region),
      role: Role.MANAGER,
      managerAccessRoleId
    },
    select: managerSelect
  });
}

export async function updateManager(input: {
  managerId: unknown;
  accessRoleId?: unknown;
  region?: unknown;
  phone?: unknown;
  name?: unknown;
}) {
  const managerId = assertNonEmpty(input.managerId, "Manager");
  const existing = await prisma.user.findUnique({
    where: { id: managerId },
    select: { id: true, role: true }
  });
  if (!existing || existing.role !== Role.MANAGER) {
    throw new AppError("MANAGER_NOT_FOUND", "Manager not found", 404);
  }

  return prisma.user.update({
    where: { id: managerId },
    data: {
      ...(input.accessRoleId === undefined
        ? {}
        : { managerAccessRoleId: await assertActiveAccessRole(input.accessRoleId) }),
      ...(input.region === undefined ? {} : { region: normalizeOptionalText(input.region) }),
      ...(input.phone === undefined ? {} : { phone: normalizeOptionalText(input.phone) }),
      ...(input.name === undefined ? {} : { name: assertNonEmpty(input.name, "Name") })
    },
    select: managerSelect
  });
}
