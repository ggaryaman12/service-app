import { prisma } from "@/lib/prisma";
import { columnExists, tableExists } from "@/lib/db-meta";
import { CloudinaryUploadField } from "@/components/cloudinary-upload-field";
import { HeroMediaFields } from "@/app/(admin)/admin/marketing/hero-media-fields";
import {
  createBanner,
  deleteBanner,
  updateAnnouncement,
  updateBannerAutoScroll,
  updateBanner,
  updateLandingHero
} from "@/app/(admin)/admin/marketing/server-actions";
import {
  AdminActionButton,
  AdminPageHeader,
  DataPanel,
  EmptyState,
  FieldShell,
  MetricCard,
  StatusPill,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass
} from "@/app/(admin)/admin/_components/admin-ui";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export default async function AdminMarketingPage() {
  await requireFeaturePermission("marketing.manage");
  const hasSiteSetting = await tableExists("SiteSetting");
  const hasBanner = await tableExists("Banner");
  const hasBannerImage = hasBanner ? await columnExists("Banner", "imageUrl") : false;

  let banners: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    tone: string;
    imageUrl: string | null;
    href: string | null;
    active: boolean;
    sortOrder: number;
  }> = [];

  let announcement = { announcementEnabled: false, announcementText: "" };
  let hero = {
    heroEnabled: true,
    heroMediaType: "VIDEO",
    heroMediaUrl: "",
    heroHeadline: "Premium home services, on-demand",
    heroSubheadline: "Verified professionals • Cash on delivery • Fast local support across Jammu",
    heroCtaText: "Explore services",
    heroCtaHref: "/services",
    bannerAutoScrollMs: 4500
  };

  try {
    if (!hasSiteSetting || !hasBanner) throw new Error("missing marketing tables");
    const [b, setting] = await Promise.all([
      prisma.banner.findMany({
        select: {
          id: true,
          title: true,
          subtitle: true,
          tone: true,
          ...(hasBannerImage ? { imageUrl: true } : {}),
          href: true,
          active: true,
          sortOrder: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } })
    ]);

    banners = b;
    announcement = {
      announcementEnabled: setting?.announcementEnabled ?? false,
      announcementText: setting?.announcementText ?? ""
    };
    hero = {
      heroEnabled: setting?.heroEnabled ?? true,
      heroMediaType: setting?.heroMediaType ?? "VIDEO",
      heroMediaUrl: setting?.heroMediaUrl ?? "",
      heroHeadline: setting?.heroHeadline ?? hero.heroHeadline,
      heroSubheadline: setting?.heroSubheadline ?? hero.heroSubheadline,
      heroCtaText: setting?.heroCtaText ?? hero.heroCtaText,
      heroCtaHref: setting?.heroCtaHref ?? hero.heroCtaHref,
      bannerAutoScrollMs: setting?.bannerAutoScrollMs ?? 4500
    };
  } catch {
    // Marketing tables may not exist until migrations are deployed.
  }

  const activeBanners = banners.filter((banner) => banner.active).length;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Content"
        title="Marketing Control"
        description="Operate homepage messaging, hero media, offer banners, and carousel behavior from a focused editorial workspace."
      />

      {!hasSiteSetting || !hasBanner ? (
        <div className="rounded-ui border border-[#f3d894] bg-[#fff7e2] p-4 text-sm font-semibold text-[#8a5a00]">
          Marketing tables are not in this database yet. Run{" "}
          <span className="font-mono">npx prisma migrate deploy</span> for migration{" "}
          <span className="font-mono">20260220_marketing</span>.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Announcement"
          value={announcement.announcementEnabled ? "On" : "Off"}
          detail={announcement.announcementText ? "Message configured" : "No message"}
          tone={announcement.announcementEnabled ? "green" : "amber"}
        />
        <MetricCard
          label="Hero"
          value={hero.heroEnabled ? "Live" : "Paused"}
          detail={hero.heroMediaType.toLowerCase()}
          tone={hero.heroEnabled ? "blue" : "neutral"}
        />
        <MetricCard
          label="Banners"
          value={`${activeBanners}/${banners.length}`}
          detail="Active offer placements"
          tone="amber"
        />
        <MetricCard
          label="Carousel"
          value={`${hero.bannerAutoScrollMs}ms`}
          detail="Mobile auto-scroll interval"
          tone="dark"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr]">
        <DataPanel title="Announcement bar" description="Top site-wide service notice.">
          <form action={updateAnnouncement} className="grid gap-4 p-4">
            <label className="flex items-center gap-2 text-sm font-bold text-[#5f574c]">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={announcement.announcementEnabled}
              />
              Enabled
            </label>
            <FieldShell label="Message">
              <textarea
                name="text"
                defaultValue={announcement.announcementText}
                placeholder="Now serving Gandhi Nagar"
                className={adminTextareaClass}
              />
            </FieldShell>
            <AdminActionButton>Save announcement</AdminActionButton>
          </form>
        </DataPanel>

        <DataPanel title="Landing hero" description="Homepage hero media, headline, supporting copy, and CTA.">
          <form action={updateLandingHero} className="grid gap-4 p-4">
            <label className="flex items-center gap-2 text-sm font-bold text-[#5f574c]">
              <input type="checkbox" name="heroEnabled" defaultChecked={hero.heroEnabled} />
              Enabled
            </label>
            <HeroMediaFields
              defaultMediaType={hero.heroMediaType === "IMAGE" ? "IMAGE" : "VIDEO"}
              defaultMediaUrl={hero.heroMediaUrl}
            />
            <FieldShell label="Headline">
              <input
                name="heroHeadline"
                defaultValue={hero.heroHeadline}
                className={adminInputClass}
                required
              />
            </FieldShell>
            <FieldShell label="Subheadline">
              <textarea
                name="heroSubheadline"
                defaultValue={hero.heroSubheadline}
                className={adminTextareaClass}
                required
              />
            </FieldShell>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldShell label="CTA text">
                <input name="heroCtaText" defaultValue={hero.heroCtaText} className={adminInputClass} />
              </FieldShell>
              <FieldShell label="CTA href">
                <input name="heroCtaHref" defaultValue={hero.heroCtaHref} className={adminInputClass} />
              </FieldShell>
            </div>
            <AdminActionButton>Save hero</AdminActionButton>
          </form>
        </DataPanel>
      </div>

      <DataPanel title="Promo banners" description="Offer placements used by the homepage carousel.">
        <div className="grid gap-4 border-b border-[#eee6d8] p-4 xl:grid-cols-[1fr_18rem]">
          <form action={createBanner} className="grid gap-3 lg:grid-cols-6">
            <FieldShell label="Title" className="lg:col-span-2">
              <input name="title" placeholder="Weekend offer" className={adminInputClass} required />
            </FieldShell>
            <FieldShell label="Subtitle" className="lg:col-span-2">
              <input name="subtitle" placeholder="Optional" className={adminInputClass} />
            </FieldShell>
            <FieldShell label="Tone">
              <select name="tone" defaultValue="blue" className={adminSelectClass}>
                <option value="blue">blue</option>
                <option value="green">green</option>
                <option value="orange">orange</option>
              </select>
            </FieldShell>
            <FieldShell label="Sort">
              <input name="sortOrder" type="number" defaultValue={0} className={adminInputClass} />
            </FieldShell>
	            {hasBannerImage ? (
	              <div className="lg:col-span-3">
	                <CloudinaryUploadField
	                  name="imageUrl"
	                  label="Banner image"
	                  resourceType="image"
	                  folder="jammuserve/banners"
	                />
	              </div>
	            ) : null}
            <FieldShell label="Link" className="lg:col-span-2">
              <input name="href" placeholder="/services" className={adminInputClass} />
            </FieldShell>
            <label className="flex items-center gap-2 pt-6 text-sm font-bold text-[#5f574c]">
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
            <AdminActionButton className="lg:col-span-6">Create banner</AdminActionButton>
          </form>

          <form action={updateBannerAutoScroll} className="rounded-ui bg-[#fbfaf6] p-4">
            <FieldShell label="Auto-scroll ms">
              <input
                name="bannerAutoScrollMs"
                type="number"
                min={2000}
                max={15000}
                defaultValue={hero.bannerAutoScrollMs}
                className={adminInputClass}
              />
            </FieldShell>
            <AdminActionButton className="mt-3 w-full">Save interval</AdminActionButton>
          </form>
        </div>

        <div className="divide-y divide-[#f0e9dc]">
          {banners.map((banner) => (
            <form
              key={banner.id}
              action={updateBanner}
              className="grid gap-3 p-4 transition-colors hover:bg-[#fffaf0] xl:grid-cols-[1fr_1fr_0.5fr_0.45fr_1fr_1fr_0.55fr_0.75fr]"
            >
              <input type="hidden" name="id" value={banner.id} />
              <input name="title" defaultValue={banner.title} className={adminInputClass} required />
              <input name="subtitle" defaultValue={banner.subtitle ?? ""} className={adminInputClass} />
              <select name="tone" defaultValue={banner.tone} className={adminSelectClass}>
                <option value="blue">blue</option>
                <option value="green">green</option>
                <option value="orange">orange</option>
              </select>
              <input name="sortOrder" type="number" defaultValue={banner.sortOrder} className={adminInputClass} />
	              {hasBannerImage ? (
	                <input
	                  name="imageUrl"
	                  defaultValue={
	                    "imageUrl" in banner ? (banner as { imageUrl?: string | null }).imageUrl ?? "" : ""
	                  }
	                  placeholder="Image URL"
	                  className={adminInputClass}
	                />
	              ) : null}
              <input name="href" defaultValue={banner.href ?? ""} placeholder="/services" className={adminInputClass} />
              <label className="flex items-center gap-2 text-sm font-bold text-[#5f574c]">
                <input type="checkbox" name="active" defaultChecked={banner.active} />
                <StatusPill tone={banner.active ? "green" : "neutral"}>
                  {banner.active ? "Active" : "Hidden"}
                </StatusPill>
              </label>
              <div className="flex justify-end gap-2">
                <AdminActionButton>Save</AdminActionButton>
                <AdminActionButton tone="light" formAction={deleteBanner} name="id" value={banner.id}>
                  Delete
                </AdminActionButton>
              </div>
            </form>
          ))}
          {banners.length === 0 ? <EmptyState>No banners yet.</EmptyState> : null}
        </div>
      </DataPanel>
    </div>
  );
}
