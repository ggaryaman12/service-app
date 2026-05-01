"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/session.service";
import {
  createBanner as createBannerService,
  deleteBanner as deleteBannerService,
  updateAnnouncement as updateAnnouncementService,
  updateBanner as updateBannerService,
  updateBannerAutoScroll as updateBannerAutoScrollService,
  updateLandingHero as updateLandingHeroService
} from "@/features/marketing/marketing.service";

function revalidateMarketing() {
  revalidatePath("/");
  revalidatePath("/admin/marketing");
}

export async function updateAnnouncement(formData: FormData) {
  await requireAdmin();
  await updateAnnouncementService({
    enabled: formData.get("enabled"),
    text: formData.get("text")
  });
  revalidateMarketing();
}

export async function updateLandingHero(formData: FormData) {
  await requireAdmin();
  await updateLandingHeroService({
    heroEnabled: formData.get("heroEnabled"),
    heroMediaType: formData.get("heroMediaType"),
    heroMediaUrl: formData.get("heroMediaUrl"),
    heroHeadline: formData.get("heroHeadline"),
    heroSubheadline: formData.get("heroSubheadline"),
    heroCtaText: formData.get("heroCtaText"),
    heroCtaHref: formData.get("heroCtaHref")
  });
  revalidateMarketing();
}

export async function updateBannerAutoScroll(formData: FormData) {
  await requireAdmin();
  await updateBannerAutoScrollService({
    bannerAutoScrollMs: formData.get("bannerAutoScrollMs")
  });
  revalidateMarketing();
}

export async function createBanner(formData: FormData) {
  await requireAdmin();
  await createBannerService({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    tone: formData.get("tone"),
    imageUrl: formData.get("imageUrl"),
    href: formData.get("href"),
    active: formData.get("active"),
    sortOrder: formData.get("sortOrder")
  });
  revalidateMarketing();
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  await updateBannerService({
    id: formData.get("id"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    tone: formData.get("tone"),
    imageUrl: formData.get("imageUrl"),
    href: formData.get("href"),
    active: formData.get("active"),
    sortOrder: formData.get("sortOrder")
  });
  revalidateMarketing();
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  await deleteBannerService(formData.get("id"));
  revalidateMarketing();
}
