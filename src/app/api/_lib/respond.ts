import { NextResponse } from "next/server";

import { toErrorResponse } from "@/features/shared/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function jsonError(error: unknown) {
  const { body, status } = toErrorResponse(error);
  return NextResponse.json(body, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => null)) as T;
}
