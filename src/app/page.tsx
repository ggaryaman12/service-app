import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TrustBadge } from "@/components/trust-badge";
import { ServiceCard } from "@/components/service-card";
import { columnExists, tableExists } from "@/lib/db-meta";
import { LandingHero } from "@/components/landing-hero";
import { OffersCarouselClient } from "@/components/offers-carousel-client";

export default async function HomePage() {
  const session = await auth();
  const hasBannerTable = await tableExists("Banner");
  const hasSiteSettingTable = await tableExists("SiteSetting");
  const hasBannerImage = hasBannerTable ? await columnExists("Banner", "imageUrl") : false;
  const hasServiceImage = await columnExists("Service", "image");

  const [categories, featuredServices, banners, siteSetting] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    }),
    prisma.service.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        estimatedMinutes: true,
        ...(hasServiceImage ? { image: true } : {}),
        category: { select: { name: true } }
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      take: 6
    }),
    hasBannerTable
      ? prisma.banner.findMany({
          select: {
            id: true,
            title: true,
            subtitle: true,
            tone: true,
            ...(hasBannerImage ? { imageUrl: true } : {}),
            href: true
          },
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: 6
        })
      : Promise.resolve([])
    ,
    hasSiteSettingTable
      ? prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null)
      : Promise.resolve(null)
  ]);

  const heroEnabled = siteSetting?.heroEnabled ?? true;

  return (
    <div className="space-y-6">
      <LandingHero
        enabled={heroEnabled}
        mediaType={siteSetting?.heroMediaType ?? "VIDEO"}
        mediaUrl={siteSetting?.heroMediaUrl ?? null}
        headline={siteSetting?.heroHeadline ?? "Premium home services, on-demand"}
        subheadline={
          siteSetting?.heroSubheadline ??
          "Verified professionals • Cash on delivery • Fast local support across Jammu"
        }
        ctaText={siteSetting?.heroCtaText ?? "Explore services"}
        ctaHref={siteSetting?.heroCtaHref ?? "/services"}
      />

      {!heroEnabled ? (
        <section className="grid gap-4 md:grid-cols-12">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-7">
            <p className="text-xs font-semibold text-slate-500">Jammu, India</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Premium home services, on-demand
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Trusted professionals • Cash on delivery • Fast local support
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="flex h-12 flex-1 items-center gap-3 rounded-full bg-slate-100 px-4 text-sm text-slate-600 transition-transform active:scale-95"
                aria-label="Search services"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-slate-500">
                  <path d="M10 2a8 8 0 105.3 14l4.7 4.7 1.4-1.4-4.7-4.7A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
                </svg>
                <span>What are you looking for?</span>
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
              >
                Explore services
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <TrustBadge tone="green" label="Verified Professionals" />
              <TrustBadge tone="blue" label="Pay After Service" />
              <TrustBadge tone="green" label="4.8 Avg Rating" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-5">
            <p className="text-xs font-semibold text-slate-500">Popular today</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Quick picks</p>
            <div className="mt-4 grid gap-3">
              {featuredServices.slice(0, 3).map((s) => (
                <Link
                  key={s.id}
                  href={`/service/${s.id}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 transition-transform active:scale-95"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.category.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">₹{s.basePrice}</span>
                </Link>
              ))}
              {featuredServices.length === 0 ? (
                <p className="text-sm text-slate-500">Add services in /admin.</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Categories</h2>
          <Link className="text-sm font-medium text-slate-600 hover:underline" href="/services">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              href={`/services?category=${encodeURIComponent(c.slug)}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition-transform active:scale-95"
            >
              <div className="h-12 w-12 rounded-2xl bg-slate-100" aria-hidden />
              <p className="text-center text-[12px] font-medium text-slate-700">{c.name}</p>
            </Link>
          ))}
          {categories.length === 0 ? (
            <div className="col-span-4 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
              No categories yet. Add them in <span className="font-mono">/admin</span>.
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Offers</h2>
        {banners.length > 0 ? (
          <OffersCarouselClient
            banners={banners.map((b) => ({
              id: b.id,
              title: b.title,
              subtitle: b.subtitle,
              tone: b.tone,
              imageUrl: "imageUrl" in b ? (b as { imageUrl?: string | null }).imageUrl ?? null : null,
              href: b.href
            }))}
            autoScrollMs={siteSetting?.bannerAutoScrollMs ?? 4500}
          />
        ) : (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            No offers yet. Admins can add offers in{" "}
            <span className="font-mono">/admin/marketing</span>.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Featured services</h2>
          <Link className="text-sm font-medium text-slate-600 hover:underline" href="/services">
            See all
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {featuredServices.map((s) => (
            <ServiceCard
              key={s.id}
              id={s.id}
              categoryName={s.category.name}
              name={s.name}
              description={s.description}
              imageUrl={"image" in s ? (s as { image?: string | null }).image ?? null : null}
              price={s.basePrice}
              minutes={s.estimatedMinutes}
            />
          ))}
          {featuredServices.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
              No services yet. Add them in <span className="font-mono">/admin</span>.
            </div>
          ) : null}
        </div>
      </section>

      {!session?.user ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-900">Get started</p>
          <p className="mt-1 text-sm text-slate-500">
            Create an account to place bookings and track status updates.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition-transform active:scale-95"
              href="/customer/register"
            >
              Register
            </Link>
            <Link
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-transform active:scale-95"
              href="/customer/login"
            >
              Login
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
