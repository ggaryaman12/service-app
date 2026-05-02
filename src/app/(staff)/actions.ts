"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/session.service";
import {
  createManager,
  createManagerAccessRole,
  updateManager,
  updateManagerAccessRole
} from "@/features/operations/manager-access.service";

function formPermissions(formData: FormData) {
  return formData.getAll("permissions").map((permission) => String(permission));
}

export async function createAccessRole(formData: FormData) {
  await requireAdmin();
  await createManagerAccessRole({
    name: formData.get("name"),
    description: formData.get("description"),
    permissions: formPermissions(formData)
  });
  revalidatePath("/roles");
  revalidatePath("/managers");
}

export async function updateAccessRole(formData: FormData) {
  await requireAdmin();
  await updateManagerAccessRole({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    permissions: formPermissions(formData),
    active: formData.get("active") === "on"
  });
  revalidatePath("/roles");
  revalidatePath("/managers");
}

export async function createManagerAccount(formData: FormData) {
  await requireAdmin();
  await createManager({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    accessRoleId: formData.get("accessRoleId")
  });
  revalidatePath("/managers");
}

export async function updateManagerAccount(formData: FormData) {
  await requireAdmin();
  const phone = formData.get("phone");
  await updateManager({
    managerId: formData.get("managerId"),
    name: formData.get("name"),
    region: formData.get("region"),
    accessRoleId: formData.get("accessRoleId"),
    ...(phone === null ? {} : { phone })
  });
  revalidatePath("/managers");
}
