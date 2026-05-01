import { NextResponse, type NextRequest } from "next/server";

import { getOpenCatalogServiceController } from "@/features/catalog/catalog.controller";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const payload = await getOpenCatalogServiceController(serviceId);

  if (!payload.data) {
    return NextResponse.json(
      { error: { code: "SERVICE_NOT_FOUND", message: "Service not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
    }
  });
}
