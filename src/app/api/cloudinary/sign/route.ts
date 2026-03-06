import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { auth } from "@/auth";
import { getCloudinaryConfig } from "@/lib/cloudinary-config";

export const runtime = "nodejs";

function sha1(input: string) {
  return createHash("sha1").update(input).digest("hex");
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return badRequest("Unauthorized", 401);
  if (session.user.role !== "ADMIN") return badRequest("Forbidden", 403);

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

