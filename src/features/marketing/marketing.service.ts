import { prisma } from "@/lib/prisma";
import { assertNonEmpty } from "@/features/shared/errors";

function parseBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

async function upsertLatestSiteSetting(data: {
  announcementEnabled?: boolean;
  announcementText?: string;
  heroEnabled?: boolean;
  heroMediaType?: string;
  heroMediaUrl?: string | null;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  heroCtaHref?: string | null;
  bannerAutoScrollMs?: number;
}) {
  const existing = await prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (existing) {
    return prisma.siteSetting.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.siteSetting.create({
    data: {
      announcementEnabled: data.announcementEnabled ?? false,
      announcementText: data.announcementText ?? "",
      heroEnabled: data.heroEnabled ?? true,
      heroMediaType: data.heroMediaType ?? "VIDEO",
      heroMediaUrl: data.heroMediaUrl ?? null,
      heroHeadline: data.heroHeadline ?? "Premium home services, on-demand",
      heroSubheadline:
        data.heroSubheadline ??
        "Verified professionals • Cash on delivery • Fast local support across Jammu",
      heroCtaText: data.heroCtaText ?? "Explore services",
      heroCtaHref: data.heroCtaHref ?? "/services",
      bannerAutoScrollMs: data.bannerAutoScrollMs ?? 4500
    }
  });
}

export async function updateAnnouncement(input: { enabled?: unknown; text?: unknown }) {
  return upsertLatestSiteSetting({
    announcementEnabled: parseBoolean(input.enabled),
    announcementText: String(input.text ?? "").trim()
  });
}

export async function updateLandingHero(input: {
  heroEnabled?: unknown;
  heroMediaType?: unknown;
  heroMediaUrl?: unknown;
  heroHeadline?: unknown;
  heroSubheadline?: unknown;
  heroCtaText?: unknown;
  heroCtaHref?: unknown;
}) {
  return upsertLatestSiteSetting({
    heroEnabled: parseBoolean(input.heroEnabled),
    heroMediaType: String(input.heroMediaType ?? "VIDEO").trim() || "VIDEO",
    heroMediaUrl: String(input.heroMediaUrl ?? "").trim() || null,
    heroHeadline: assertNonEmpty(input.heroHeadline, "Headline"),
    heroSubheadline: assertNonEmpty(input.heroSubheadline, "Subheadline"),
    heroCtaText: String(input.heroCtaText ?? "").trim() || "Explore services",
    heroCtaHref: String(input.heroCtaHref ?? "").trim() || null
  });
}

export async function updateBannerAutoScroll(input: { bannerAutoScrollMs?: unknown }) {
  const ms = Number(String(input.bannerAutoScrollMs ?? "4500"));
  const bannerAutoScrollMs = Number.isFinite(ms) ? Math.max(2000, Math.min(15000, ms)) : 4500;
  return upsertLatestSiteSetting({ bannerAutoScrollMs });
}

export async function createBanner(input: {
  title: unknown;
  subtitle?: unknown;
  tone?: unknown;
  imageUrl?: unknown;
  href?: unknown;
  active?: unknown;
  sortOrder?: unknown;
}) {
  return prisma.banner.create({
    data: {
      title: assertNonEmpty(input.title, "Title"),
      subtitle: String(input.subtitle ?? "").trim() || null,
      tone: String(input.tone ?? "blue").trim() || "blue",
      imageUrl: String(input.imageUrl ?? "").trim() || null,
      href: String(input.href ?? "").trim() || null,
      active: parseBoolean(input.active),
      sortOrder: Number(String(input.sortOrder ?? "0")) || 0
    }
  });
}

export async function updateBanner(input: {
  id: unknown;
  title: unknown;
  subtitle?: unknown;
  tone?: unknown;
  imageUrl?: unknown;
  href?: unknown;
  active?: unknown;
  sortOrder?: unknown;
}) {
  return prisma.banner.update({
    where: { id: assertNonEmpty(input.id, "ID") },
    data: {
      title: assertNonEmpty(input.title, "Title"),
      subtitle: String(input.subtitle ?? "").trim() || null,
      tone: String(input.tone ?? "blue").trim() || "blue",
      imageUrl: String(input.imageUrl ?? "").trim() || null,
      href: String(input.href ?? "").trim() || null,
      active: parseBoolean(input.active),
      sortOrder: Number(String(input.sortOrder ?? "0")) || 0
    }
  });
}

export async function deleteBanner(id: unknown) {
  return prisma.banner.delete({ where: { id: assertNonEmpty(id, "ID") } });
}
