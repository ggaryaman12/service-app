"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { hashPassword } from "@/lib/password";

function requireNonEmpty(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new Error(`${field} is required`);
  return str;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = requireNonEmpty(formData.get("name"), "Name");
  const slug = requireNonEmpty(formData.get("slug"), "Slug");
  const image = String(formData.get("image") ?? "").trim() || null;
  const active = Boolean(formData.get("active"));

  await prisma.category.create({
    data: { name, slug, image, active }
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = requireNonEmpty(formData.get("id"), "ID");
  const name = requireNonEmpty(formData.get("name"), "Name");
  const slug = requireNonEmpty(formData.get("slug"), "Slug");
  const image = String(formData.get("image") ?? "").trim() || null;
  const active = Boolean(formData.get("active"));

  await prisma.category.update({
    where: { id },
    data: { name, slug, image, active }
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = requireNonEmpty(formData.get("id"), "ID");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function createService(formData: FormData) {
  await requireAdmin();
  const categoryId = requireNonEmpty(formData.get("categoryId"), "Category");
  const name = requireNonEmpty(formData.get("name"), "Name");
  const description = requireNonEmpty(formData.get("description"), "Description");
  const image = String(formData.get("image") ?? "").trim() || null;
  const basePrice = Number(requireNonEmpty(formData.get("basePrice"), "Base price"));
  const estimatedMinutes = Number(
    requireNonEmpty(formData.get("estimatedMinutes"), "Estimated minutes")
  );

  await prisma.service.create({
    data: { categoryId, name, description, image, basePrice, estimatedMinutes }
  });
  revalidatePath("/admin/services");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = requireNonEmpty(formData.get("id"), "ID");
  const categoryId = requireNonEmpty(formData.get("categoryId"), "Category");
  const name = requireNonEmpty(formData.get("name"), "Name");
  const description = requireNonEmpty(formData.get("description"), "Description");
  const image = String(formData.get("image") ?? "").trim() || null;
  const basePrice = Number(requireNonEmpty(formData.get("basePrice"), "Base price"));
  const estimatedMinutes = Number(
    requireNonEmpty(formData.get("estimatedMinutes"), "Estimated minutes")
  );

  await prisma.service.update({
    where: { id },
    data: { categoryId, name, description, image, basePrice, estimatedMinutes }
  });
  revalidatePath("/admin/services");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = requireNonEmpty(formData.get("id"), "ID");
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
}

export async function createStaffUser(formData: FormData) {
  await requireAdmin();
  const name = requireNonEmpty(formData.get("name"), "Name");
  const email = requireNonEmpty(formData.get("email"), "Email").toLowerCase();
  const password = requireNonEmpty(formData.get("password"), "Password");
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  const role = requireNonEmpty(formData.get("role"), "Role") as Role;

  if (role !== "MANAGER" && role !== "WORKER") {
    throw new Error("Only MANAGER/WORKER can be created here");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      phone,
      region,
      role
    }
  });

  if (role === "WORKER") {
    await prisma.workerProfile.create({
      data: {
        userId: user.id,
        skills: []
      }
    });
  }

  revalidatePath("/admin/users");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  const userId = requireNonEmpty(formData.get("userId"), "User ID");
  const role = requireNonEmpty(formData.get("role"), "Role") as Role;

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  if (role === "WORKER") {
    await prisma.workerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, skills: [] }
    });
  }

  revalidatePath("/admin/users");
}
