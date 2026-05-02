import { auth } from "@/auth";
import { HomeIntroOverlay } from "@/components/home-intro-overlay";
import { LandingHero } from "@/components/landing-hero";
import { LandingReveal } from "@/components/landing-reveal";
import { LandingStory } from "@/components/landing-story";
import { TransitionLink } from "@/components/route-transition";
import { tableExists } from "@/lib/db-meta";
import { prisma } from "@/lib/prisma";

const customerRoutes = [
  {
    eyebrow: "Book",
    title: "Explore services",
    body: "Browse the catalog and choose a service flow.",
    href: "/services",
    cta: "View services"
  },
  {
    eyebrow: "Track",
    title: "Follow bookings",
    body: "Open active visits, status changes, and history.",
    href: "/account",
    cta: "Open bookings"
  },
  {
    eyebrow: "Start",
    title: "Create profile",
    body: "Save your details for faster checkout next time.",
    href: "/customer/register",
    cta: "Create account"
  }
] as const;

const fallbackHeroVideoUrl =
  "https://cdn.coverr.co/videos/coverr-premium-cleaning-up-a-pet-s-fur-in-the-home-5686/1080p.mp4";

export default async function HomePage() {
  const session = await auth();
  const hasSiteSettingTable = await tableExists("SiteSetting");
  const siteSetting = hasSiteSettingTable
    ? await prisma.siteSetting.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null)
    : null;

  const heroEnabled = siteSetting?.heroEnabled ?? true;
  const configuredHeroMediaUrl = siteSetting?.heroMediaUrl?.trim() || null;
  const heroMediaType = configuredHeroMediaUrl
    ? siteSetting?.heroMediaType ?? "VIDEO"
    : "VIDEO";
  const heroMediaUrl = configuredHeroMediaUrl ?? fallbackHeroVideoUrl;

  return (
    <div className="space-y-0">
      <HomeIntroOverlay />

      <LandingHero
        enabled={heroEnabled}
        mediaType={heroMediaType}
        mediaUrl={heroMediaUrl}
        headline={siteSetting?.heroHeadline ?? "Premium home services, on-demand"}
        subheadline={
          siteSetting?.heroSubheadline ??
          "Verified professionals, pay-after-service checkout, and fast local support across Jammu."
        }
        ctaText={siteSetting?.heroCtaText ?? "Explore services"}
        ctaHref={siteSetting?.heroCtaHref ?? "/services"}
      />

      <LandingStory />

      <LandingReveal>
        <section className="-mx-4 bg-surface-default px-4 py-14 md:-mx-6 md:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-5 md:grid-cols-2 md:items-end">
              <div>
                <p className="text-caption font-semibold uppercase tracking-widest text-brand-primary">
                  Next step
                </p>
                <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-text-primary md:text-6xl">
                  Choose where your service day goes next.
                </h2>
              </div>
              <p className="max-w-2xl text-body text-text-secondary">
                Jump straight to discovery, account tracking, or a saved profile. The home page
                stays focused on the journey; each action opens a dedicated screen.
              </p>
            </div>

            <div className="mt-10 grid gap-3">
              {customerRoutes.map((route) => (
                <TransitionLink
                  key={route.href}
                  href={route.href}
                  transitionLabel={route.title}
                  className="group flex min-h-28 flex-col justify-between gap-5 rounded-ui-lg border border-border-subtle bg-surface-elevated p-5 transition hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary-muted active:scale-95 md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-widest text-brand-primary">
                      {route.eyebrow}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-normal text-text-primary">
                      {route.title}
                    </h3>
                    <p className="mt-3 text-body-sm text-text-secondary">{route.body}</p>
                  </div>
                  <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-surface-inverse px-5 text-sm font-semibold text-text-inverse transition group-hover:bg-brand-primary">
                    {route.cta}
                  </span>
                </TransitionLink>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {session?.user ? (
                <TransitionLink
                  href="/account"
                  transitionLabel="Account"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
                >
                  Continue to account
                </TransitionLink>
              ) : (
                <>
                  <TransitionLink
                    href="/customer/login"
                    transitionLabel="Customer login"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
                  >
                    Customer login
                  </TransitionLink>
                  <TransitionLink
                    href="/staff/login"
                    transitionLabel="Staff login"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-surface-muted px-5 text-sm font-semibold text-text-secondary transition hover:bg-brand-primary-muted active:scale-95"
                  >
                    Staff login
                  </TransitionLink>
                </>
              )}
            </div>
          </div>
        </section>
      </LandingReveal>
    </div>
  );
}
