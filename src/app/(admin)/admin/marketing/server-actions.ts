"use server";

import { revalidatePath } from "next/cache";

import {
  createBanner as createBannerService,
  deleteBanner as deleteBannerService,
  updateAnnouncement as updateAnnouncementService,
  updateBanner as updateBannerService,
  updateBannerAutoScroll as updateBannerAutoScrollService,
  updateLandingHero as updateLandingHeroService
} from "@/features/marketing/marketing.service";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

function revalidateMarketing() {
  revalidatePath("/");
  revalidatePath("/marketing");
}

export async function updateAnnouncement(formData: FormData) {
  await requireFeaturePermission("marketing.manage");
  await updateAnnouncementService({
    enabled: formData.get("enabled"),
    text: formData.get("text")
  });
  revalidateMarketing();
}

export async function updateLandingHero(formData: FormData) {
  await requireFeaturePermission("marketing.manage");
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
  await requireFeaturePermission("marketing.manage");
  await updateBannerAutoScrollService({
    bannerAutoScrollMs: formData.get("bannerAutoScrollMs")
  });
  revalidateMarketing();
}

export async function createBanner(formData: FormData) {
  await requireFeaturePermission("marketing.manage");
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
  await requireFeaturePermission("marketing.manage");
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
  await requireFeaturePermission("marketing.manage");
  await deleteBannerService(formData.get("id"));
  revalidateMarketing();
}
