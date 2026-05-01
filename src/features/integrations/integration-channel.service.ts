import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { AppError, assertNonEmpty } from "@/features/shared/errors";

export type IntegrationScope =
  | "catalog:read"
  | "booking:create"
  | "booking:status";

export type AuthenticatedIntegrationChannel = {
  id: string;
  name: string;
  scopes: IntegrationScope[];
};

function hashApiKey(apiKey: string) {
  return createHash("sha256").update(apiKey).digest("hex");
}

function generateApiKey() {
  return `js_${randomBytes(32).toString("base64url")}`;
}

function normalizeScopes(value: unknown): IntegrationScope[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<IntegrationScope>([
    "catalog:read",
    "booking:create",
    "booking:status"
  ]);
  return value.filter((scope): scope is IntegrationScope => allowed.has(scope));
}

function requireScope(
  channel: AuthenticatedIntegrationChannel,
  requiredScope: IntegrationScope
) {
  if (!channel.scopes.includes(requiredScope)) {
    throw new AppError("CHANNEL_FORBIDDEN", "Channel is not allowed for this API", 403);
  }
}

export async function authenticateIntegrationChannel(
  apiKey: string | null,
  requiredScope: IntegrationScope
): Promise<AuthenticatedIntegrationChannel> {
  const key = String(apiKey ?? "").trim();
  if (!key) throw new AppError("MISSING_API_KEY", "Missing API key", 401);

  const channel = await prisma.integrationChannel.findUnique({
    where: { keyHash: hashApiKey(key) },
    select: { id: true, name: true, scopes: true, active: true }
  });

  if (!channel || !channel.active) {
    throw new AppError("INVALID_API_KEY", "Invalid API key", 401);
  }

  const authenticated = {
    id: channel.id,
    name: channel.name,
    scopes: normalizeScopes(channel.scopes)
  };
  requireScope(authenticated, requiredScope);
  return authenticated;
}

export async function listIntegrationChannels() {
  const channels = await prisma.integrationChannel.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      scopes: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return channels.map((channel) => ({
    ...channel,
    scopes: normalizeScopes(channel.scopes)
  }));
}

export async function createIntegrationChannel(input: {
  name: string;
  scopes?: unknown;
}) {
  const name = assertNonEmpty(input.name, "Name");
  const scopes = normalizeScopes(input.scopes);
  if (scopes.length === 0) {
    throw new AppError("VALIDATION_ERROR", "At least one scope is required", 400);
  }

  const apiKey = generateApiKey();
  const channel = await prisma.integrationChannel.create({
    data: {
      name,
      keyHash: hashApiKey(apiKey),
      scopes,
      active: true
    },
    select: {
      id: true,
      name: true,
      scopes: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return {
    channel: {
      ...channel,
      scopes: normalizeScopes(channel.scopes)
    },
    apiKey
  };
}

export async function rotateIntegrationChannelKey(channelId: string) {
  const id = assertNonEmpty(channelId, "Channel ID");
  const apiKey = generateApiKey();
  const channel = await prisma.integrationChannel.update({
    where: { id },
    data: { keyHash: hashApiKey(apiKey) },
    select: {
      id: true,
      name: true,
      scopes: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return {
    channel: {
      ...channel,
      scopes: normalizeScopes(channel.scopes)
    },
    apiKey
  };
}

export async function setIntegrationChannelActive(
  channelId: string,
  active: boolean
) {
  const id = assertNonEmpty(channelId, "Channel ID");
  const channel = await prisma.integrationChannel.update({
    where: { id },
    data: { active },
    select: {
      id: true,
      name: true,
      scopes: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return {
    ...channel,
    scopes: normalizeScopes(channel.scopes)
  };
}
