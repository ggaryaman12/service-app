import { prisma } from "@/lib/prisma";
import { columnExists, tableExists } from "@/lib/db-meta";
import { CloudinaryUploadField } from "@/components/cloudinary-upload-field";
import { HeroMediaFields } from "@/app/admin/marketing/hero-media-fields";
import {
  createBanner,
  deleteBanner,
  updateAnnouncement,
  updateBannerAutoScroll,
  updateBanner
  ,
  updateLandingHero
} from "@/app/admin/marketing/server-actions";

export default async function AdminMarketingPage() {
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
    if (!hasSiteSetting || !hasBanner) throw new Error("missing tables");
    const [b, s] = await Promise.all([
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
      announcementEnabled: s?.announcementEnabled ?? false,
      announcementText: s?.announcementText ?? ""
    };
    hero = {
      heroEnabled: s?.heroEnabled ?? true,
      heroMediaType: s?.heroMediaType ?? "VIDEO",
      heroMediaUrl: s?.heroMediaUrl ?? "",
      heroHeadline: s?.heroHeadline ?? hero.heroHeadline,
      heroSubheadline: s?.heroSubheadline ?? hero.heroSubheadline,
      heroCtaText: s?.heroCtaText ?? hero.heroCtaText,
      heroCtaHref: s?.heroCtaHref ?? hero.heroCtaHref,
      bannerAutoScrollMs: s?.bannerAutoScrollMs ?? 4500
    };
  } catch {
    // Tables may not exist until migration is deployed.
  }

  return (
    <div className="space-y-6">
      {!hasSiteSetting || !hasBanner ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          Marketing tables aren’t in your database yet. Run{" "}
          <span className="font-mono">npx prisma migrate deploy</span> after adding the new migration{" "}
          <span className="font-mono">20260220_marketing</span>.
        </div>
      ) : null}
      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold">Announcement bar</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Controls the top site-wide announcement. Requires the marketing migration to be applied.
        </p>
        <form action={updateAnnouncement} className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={announcement.announcementEnabled}
            />
            Enabled
          </label>
          <textarea
            name="text"
            defaultValue={announcement.announcementText}
            placeholder="e.g. Now serving Gandhi Nagar • Pay after service (COD)"
            className="min-h-20 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
            Save announcement
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold">Landing page hero</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Full-screen video/image hero on the homepage. For video, paste a direct MP4 URL (Cloudinary works well).
        </p>
        <form action={updateLandingHero} className="mt-3 grid gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="heroEnabled" defaultChecked={hero.heroEnabled} />
            Enabled
          </label>
          <HeroMediaFields
            defaultMediaType={hero.heroMediaType === "IMAGE" ? "IMAGE" : "VIDEO"}
            defaultMediaUrl={hero.heroMediaUrl}
          />
          <input
            name="heroHeadline"
            defaultValue={hero.heroHeadline}
            placeholder="Headline"
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            required
          />
          <textarea
            name="heroSubheadline"
            defaultValue={hero.heroSubheadline}
            placeholder="Subheadline"
            className="min-h-20 rounded-md border border-neutral-200 px-3 py-2 text-sm"
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="heroCtaText"
              defaultValue={hero.heroCtaText}
              placeholder="CTA text"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              name="heroCtaHref"
              defaultValue={hero.heroCtaHref}
              placeholder="CTA href (e.g. /services)"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="w-fit rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
            Save hero
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold">Banner auto-scroll</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Controls the offers carousel scroll interval on mobile (milliseconds).
        </p>
        <form action={updateBannerAutoScroll} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="bannerAutoScrollMs">
              Auto-scroll ms
            </label>
            <input
              id="bannerAutoScrollMs"
              name="bannerAutoScrollMs"
              type="number"
              min={2000}
              max={15000}
              defaultValue={hero.bannerAutoScrollMs}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="w-fit rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
            Save
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Promo banners</h2>
          <p className="mt-1 text-xs text-neutral-500">
            These show on the home page Offers section.
          </p>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold">Create banner</h3>
          <form action={createBanner} className="mt-3 grid gap-3 sm:grid-cols-6">
            <input
              name="title"
              placeholder="Title"
              required
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="subtitle"
              placeholder="Subtitle (optional)"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <CloudinaryUploadField
                name="imageUrl"
                label="Banner image (optional)"
                resourceType="image"
                folder="jammuserve/banners"
              />
            </div>
            <select
              name="tone"
              defaultValue="blue"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="blue">blue</option>
              <option value="green">green</option>
              <option value="orange">orange</option>
            </select>
            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              name="href"
              placeholder="Link (optional) e.g. /services"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-4"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-1">
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
            <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white sm:col-span-1">
              Create
            </button>
          </form>
        </div>

        <div className="divide-y divide-neutral-200">
          {banners.map((b) => (
            <div key={b.id} className="p-4">
              <form action={updateBanner} className="grid gap-3 sm:grid-cols-8">
                <input type="hidden" name="id" value={b.id} />
                <input
                  name="title"
                  defaultValue={b.title}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
                  required
                />
                <input
                  name="subtitle"
                  defaultValue={b.subtitle ?? ""}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
                />
                <select
                  name="tone"
                  defaultValue={b.tone}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option value="blue">blue</option>
                  <option value="green">green</option>
                  <option value="orange">orange</option>
                </select>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={b.sortOrder}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                />
                <input
                  name="imageUrl"
                  defaultValue={"imageUrl" in b ? (b as { imageUrl?: string | null }).imageUrl ?? "" : ""}
                  placeholder="Image URL (optional)"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="href"
                  defaultValue={b.href ?? ""}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
                />
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="active" defaultChecked={b.active} />
                  Active
                </label>
                <div className="flex items-center gap-2">
                  <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
                    Save
                  </button>
                  <button
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    formAction={deleteBanner}
                    name="id"
                    value={b.id}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          ))}
          {banners.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">No banners yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
