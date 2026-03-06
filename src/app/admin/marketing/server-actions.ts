"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function requireNonEmpty(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new Error(`${field} is required`);
  return str;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function updateAnnouncement(formData: FormData) {
  await requireAdmin();
  const enabled = Boolean(formData.get("enabled"));
  const text = String(formData.get("text") ?? "").trim();

  const existing = await prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (existing) {
    await prisma.siteSetting.update({
      where: { id: existing.id },
      data: { announcementEnabled: enabled, announcementText: text }
    });
  } else {
    await prisma.siteSetting.create({
      data: {
        announcementEnabled: enabled,
        announcementText: text,
        heroHeadline: "Premium home services, on-demand",
        heroSubheadline: "Verified professionals • Cash on delivery • Fast local support across Jammu"
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/marketing");
}

export async function updateLandingHero(formData: FormData) {
  await requireAdmin();
  const enabled = Boolean(formData.get("heroEnabled"));
  const mediaType = String(formData.get("heroMediaType") ?? "VIDEO").trim() || "VIDEO";
  const mediaUrl = String(formData.get("heroMediaUrl") ?? "").trim() || null;
  const headline = String(formData.get("heroHeadline") ?? "").trim();
  const subheadline = String(formData.get("heroSubheadline") ?? "").trim();
  const ctaText = String(formData.get("heroCtaText") ?? "").trim() || "Explore services";
  const ctaHref = String(formData.get("heroCtaHref") ?? "").trim() || null;

  if (!headline || !subheadline) throw new Error("Headline and subheadline are required");

  const existing = await prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (existing) {
    await prisma.siteSetting.update({
      where: { id: existing.id },
      data: {
        heroEnabled: enabled,
        heroMediaType: mediaType,
        heroMediaUrl: mediaUrl,
        heroHeadline: headline,
        heroSubheadline: subheadline,
        heroCtaText: ctaText,
        heroCtaHref: ctaHref
      }
    });
  } else {
    await prisma.siteSetting.create({
      data: {
        announcementEnabled: false,
        announcementText: "",
        heroEnabled: enabled,
        heroMediaType: mediaType,
        heroMediaUrl: mediaUrl,
        heroHeadline: headline,
        heroSubheadline: subheadline,
        heroCtaText: ctaText,
        heroCtaHref: ctaHref
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/marketing");
}

export async function updateBannerAutoScroll(formData: FormData) {
  await requireAdmin();
  const ms = Number(String(formData.get("bannerAutoScrollMs") ?? "4500"));
  const bannerAutoScrollMs = Number.isFinite(ms) ? Math.max(2000, Math.min(15000, ms)) : 4500;

  const existing = await prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (existing) {
    await prisma.siteSetting.update({
      where: { id: existing.id },
      data: { bannerAutoScrollMs }
    });
  } else {
    await prisma.siteSetting.create({
      data: {
        announcementEnabled: false,
        announcementText: "",
        heroHeadline: "Premium home services, on-demand",
        heroSubheadline: "Verified professionals • Cash on delivery • Fast local support across Jammu",
        bannerAutoScrollMs
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/marketing");
}

export async function createBanner(formData: FormData) {
  await requireAdmin();
  const title = requireNonEmpty(formData.get("title"), "Title");
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const tone = String(formData.get("tone") ?? "blue").trim() || "blue";
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const href = String(formData.get("href") ?? "").trim() || null;
  const active = Boolean(formData.get("active"));
  const sortOrder = Number(String(formData.get("sortOrder") ?? "0"));

  await prisma.banner.create({
    data: { title, subtitle, tone, imageUrl, href, active, sortOrder }
  });

  revalidatePath("/");
  revalidatePath("/admin/marketing");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  const id = requireNonEmpty(formData.get("id"), "ID");
  const title = requireNonEmpty(formData.get("title"), "Title");
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const tone = String(formData.get("tone") ?? "blue").trim() || "blue";
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const href = String(formData.get("href") ?? "").trim() || null;
  const active = Boolean(formData.get("active"));
  const sortOrder = Number(String(formData.get("sortOrder") ?? "0"));

  await prisma.banner.update({
    where: { id },
    data: { title, subtitle, tone, imageUrl, href, active, sortOrder }
  });

  revalidatePath("/");
  revalidatePath("/admin/marketing");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const id = requireNonEmpty(formData.get("id"), "ID");
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/marketing");
}
