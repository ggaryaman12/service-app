import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCloudinaryConfig } from "@/lib/cloudinary-config";
import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  assertAccessPermission,
  resolveOperationsAccess,
  type AccessPermission
} from "@/features/operations/operations-access";

export const runtime = "nodejs";

function sha1(input: string) {
  return createHash("sha1").update(input).digest("hex");
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function permissionForFolder(folder: string): AccessPermission | null {
  if (folder === "jammuserve/services" || folder.startsWith("jammuserve/services/")) {
    return "catalog.edit";
  }
  if (
    folder === "jammuserve/hero" ||
    folder.startsWith("jammuserve/hero/") ||
    folder === "jammuserve/banners" ||
    folder.startsWith("jammuserve/banners/")
  ) {
    return "marketing.manage";
  }
  return null;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { folder?: string; resourceType?: "image" | "video"; publicId?: string }
    | null;
  if (!body) return badRequest("Invalid JSON");

  const folder = String(body.folder ?? "").trim();
  const resourceType = body.resourceType === "video" ? "video" : "image";
  const publicId = body.publicId ? String(body.publicId).trim() : null;

  if (!folder || !folder.startsWith("jammuserve/")) {
    return badRequest("Invalid folder (must start with jammuserve/)");
  }
  const permission = permissionForFolder(folder);
  if (!permission) return badRequest("Folder is not allowed", 403);

  try {
    const viewer = await requireStaffFeatureUser();
    const access = resolveOperationsAccess(viewer);
    assertAccessPermission(access, permission);
  } catch (error) {
    const status = error instanceof Error && "status" in error
      ? Number((error as { status?: number }).status)
      : 403;
    return badRequest(status === 401 ? "Unauthorized" : "Forbidden", status === 401 ? 401 : 403);
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);

  const params: Record<string, string | number> = { folder, timestamp };
  if (publicId) params.public_id = publicId;

  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const signature = sha1(toSign + apiSecret);

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    resourceType,
    publicId,
    signature
  });
}
