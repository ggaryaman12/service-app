import { NextResponse, type NextRequest } from "next/server";

import { getOpenCatalogController } from "@/features/catalog/catalog.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const payload = await getOpenCatalogController({
    q: searchParams.get("q") ?? undefined,
    categorySlug: searchParams.get("category") ?? undefined
  });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
    }
  });
}
