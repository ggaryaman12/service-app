import { Role } from "@prisma/client";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { columnExists } from "@/lib/db-meta";
import { AppError, assertNonEmpty } from "@/features/shared/errors";

function parseBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

function parseNumber(value: unknown, field: string) {
  const number = Number(assertNonEmpty(value, field));
  if (!Number.isFinite(number)) {
    throw new AppError("VALIDATION_ERROR", `${field} must be a number`, 400);
  }
  return number;
}

export async function listAdminCatalog() {
  const [categories, services] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
    })
  ]);

  return { categories, services };
}

export async function createCategory(input: {
  name: unknown;
  slug: unknown;
  image?: unknown;
  active?: unknown;
}) {
  return prisma.category.create({
    data: {
      name: assertNonEmpty(input.name, "Name"),
      slug: assertNonEmpty(input.slug, "Slug"),
      image: String(input.image ?? "").trim() || null,
      active: parseBoolean(input.active)
    }
  });
}

export async function updateCategory(input: {
  id: unknown;
  name: unknown;
  slug: unknown;
  image?: unknown;
  active?: unknown;
}) {
  return prisma.category.update({
    where: { id: assertNonEmpty(input.id, "ID") },
    data: {
      name: assertNonEmpty(input.name, "Name"),
      slug: assertNonEmpty(input.slug, "Slug"),
      image: String(input.image ?? "").trim() || null,
      active: parseBoolean(input.active)
    }
  });
}

export async function deleteCategory(id: unknown) {
  return prisma.category.delete({ where: { id: assertNonEmpty(id, "ID") } });
}

export async function createService(input: {
  categoryId: unknown;
  name: unknown;
  description: unknown;
  image?: unknown;
  basePrice: unknown;
  estimatedMinutes: unknown;
}) {
  const hasServiceImage = await columnExists("Service", "image");

  return prisma.service.create({
    data: {
      categoryId: assertNonEmpty(input.categoryId, "Category"),
      name: assertNonEmpty(input.name, "Name"),
      description: assertNonEmpty(input.description, "Description"),
      ...(hasServiceImage ? { image: String(input.image ?? "").trim() || null } : {}),
      basePrice: parseNumber(input.basePrice, "Base price"),
      estimatedMinutes: parseNumber(input.estimatedMinutes, "Estimated minutes")
    }
  });
}

export async function updateService(input: {
  id: unknown;
  categoryId: unknown;
  name: unknown;
  description: unknown;
  image?: unknown;
  basePrice: unknown;
  estimatedMinutes: unknown;
}) {
  const hasServiceImage = await columnExists("Service", "image");

  return prisma.service.update({
    where: { id: assertNonEmpty(input.id, "ID") },
    data: {
      categoryId: assertNonEmpty(input.categoryId, "Category"),
      name: assertNonEmpty(input.name, "Name"),
      description: assertNonEmpty(input.description, "Description"),
      ...(hasServiceImage ? { image: String(input.image ?? "").trim() || null } : {}),
      basePrice: parseNumber(input.basePrice, "Base price"),
      estimatedMinutes: parseNumber(input.estimatedMinutes, "Estimated minutes")
    }
  });
}

export async function deleteService(id: unknown) {
  return prisma.service.delete({ where: { id: assertNonEmpty(id, "ID") } });
}

function parseStaffRole(value: unknown) {
  const role = assertNonEmpty(value, "Role") as Role;
  if (role !== Role.MANAGER && role !== Role.WORKER) {
    throw new AppError("VALIDATION_ERROR", "Only MANAGER/WORKER can be created here", 400);
  }
  return role;
}

export async function createStaffUser(input: {
  name: unknown;
  email: unknown;
  password: unknown;
  phone?: unknown;
  region?: unknown;
  role: unknown;
}) {
  const role = parseStaffRole(input.role);
  const user = await prisma.user.create({
    data: {
      name: assertNonEmpty(input.name, "Name"),
      email: assertNonEmpty(input.email, "Email").toLowerCase(),
      passwordHash: hashPassword(assertNonEmpty(input.password, "Password")),
      phone: String(input.phone ?? "").trim() || null,
      region: String(input.region ?? "").trim() || null,
      role
    }
  });

  if (role === Role.WORKER) {
    await prisma.workerProfile.create({
      data: { userId: user.id, skills: [] }
    });
  }

  return user;
}

export async function updateUserRole(input: { userId: unknown; role: unknown }) {
  const userId = assertNonEmpty(input.userId, "User ID");
  const role = assertNonEmpty(input.role, "Role") as Role;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  if (role === Role.WORKER) {
    await prisma.workerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, skills: [] }
    });
  } else {
    await prisma.workerProfile.deleteMany({ where: { userId } });
  }

  return user;
}
