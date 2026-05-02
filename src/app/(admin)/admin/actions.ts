"use server";

import { revalidatePath } from "next/cache";

import { requireFeaturePermission } from "@/features/operations/permission-guard.service";
import {
  createCategory as createCategoryService,
  createService as createServiceService,
  deleteCategory as deleteCategoryService,
  deleteService as deleteServiceService,
  updateCategory as updateCategoryService,
  updateService as updateServiceService
} from "@/features/admin/admin.service";

function revalidateCatalog() {
  revalidatePath("/catalog/categories");
  revalidatePath("/catalog/services");
  revalidatePath("/services");
}

export async function createCategory(formData: FormData) {
  await requireFeaturePermission("catalog.edit");
  await createCategoryService({
    name: formData.get("name"),
    slug: formData.get("slug"),
    image: formData.get("image"),
    active: formData.get("active")
  });
  revalidateCatalog();
}

export async function updateCategory(formData: FormData) {
  await requireFeaturePermission("catalog.edit");
  await updateCategoryService({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    image: formData.get("image"),
    active: formData.get("active")
  });
  revalidateCatalog();
}

export async function deleteCategory(formData: FormData) {
  await requireFeaturePermission("catalog.edit");
  await deleteCategoryService(formData.get("id"));
  revalidateCatalog();
}

export async function createService(formData: FormData) {
  await requireFeaturePermission("catalog.edit");
  await createServiceService({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    basePrice: formData.get("basePrice"),
    estimatedMinutes: formData.get("estimatedMinutes")
  });
  revalidateCatalog();
}

export async function updateService(formData: FormData) {
  await requireFeaturePermission("catalog.edit");
  await updateServiceService({
    id: formData.get("id"),
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    basePrice: formData.get("basePrice"),
    estimatedMinutes: formData.get("estimatedMinutes")
  });
  revalidateCatalog();
}

export async function deleteService(formData: FormData) {
  await requireFeaturePermission("catalog.edit");
  await deleteServiceService(formData.get("id"));
  revalidateCatalog();
}
