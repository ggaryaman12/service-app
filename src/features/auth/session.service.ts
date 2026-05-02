import type { Role } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/features/shared/errors";

export async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
  }

  return {
    email: session.user.email,
    role: session.user.role
  };
}

export async function requireRole(allowedRoles: Role[]) {
  const sessionUser = await requireSessionUser();
  if (!allowedRoles.includes(sessionUser.role)) {
    throw new AppError("FORBIDDEN", "Forbidden", 403);
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      region: true,
      managerAccessRole: {
        select: {
          id: true,
          name: true,
          permissions: true,
          active: true
        }
      }
    }
  });
  if (!user) throw new AppError("USER_NOT_FOUND", "User not found", 404);
  if (!allowedRoles.includes(user.role as Role)) {
    throw new AppError("FORBIDDEN", "Forbidden", 403);
  }

  return user;
}

export async function requireCustomer() {
  return requireRole(["CUSTOMER"]);
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireOperationsUser() {
  return requireRole(["ADMIN", "MANAGER"]);
}

export async function requireStaffFeatureUser() {
  return requireRole(["ADMIN", "MANAGER"]);
}

export async function requireManager() {
  return requireOperationsUser();
}

export async function requireWorker() {
  return requireRole(["WORKER", "ADMIN"]);
}
