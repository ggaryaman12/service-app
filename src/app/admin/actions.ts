"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/session.service";
import {
  createCategory as createCategoryService,
  createService as createServiceService,
  createStaffUser as createStaffUserService,
  deleteCategory as deleteCategoryService,
  deleteService as deleteServiceService,
  updateCategory as updateCategoryService,
  updateService as updateServiceService,
  updateUserRole as updateUserRoleService
} from "@/features/admin/admin.service";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  await createCategoryService({
    name: formData.get("name"),
    slug: formData.get("slug"),
    image: formData.get("image"),
    active: formData.get("active")
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  await updateCategoryService({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    image: formData.get("image"),
    active: formData.get("active")
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await deleteCategoryService(formData.get("id"));
  revalidatePath("/admin/categories");
}

export async function createService(formData: FormData) {
  await requireAdmin();
  await createServiceService({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    basePrice: formData.get("basePrice"),
    estimatedMinutes: formData.get("estimatedMinutes")
  });
  revalidatePath("/admin/services");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  await updateServiceService({
    id: formData.get("id"),
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    basePrice: formData.get("basePrice"),
    estimatedMinutes: formData.get("estimatedMinutes")
  });
  revalidatePath("/admin/services");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  await deleteServiceService(formData.get("id"));
  revalidatePath("/admin/services");
}

export async function createStaffUser(formData: FormData) {
  await requireAdmin();
  await createStaffUserService({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    role: formData.get("role")
  });
  revalidatePath("/admin/users");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  await updateUserRoleService({
    userId: formData.get("userId"),
    role: formData.get("role")
  });
  revalidatePath("/admin/users");
}
