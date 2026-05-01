import { ServiceCard } from "@/components/service-card";
import { CartBar } from "@/components/cart/cart-bar";
import { getCatalogSnapshot } from "@/features/catalog/catalog.service";

export default async function ServicesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();
  const categorySlug = (sp.category ?? "").trim();

  const { services, categories, activeCategory } = await getCatalogSnapshot({
    q,
    categorySlug
  });

  const prices = Object.fromEntries(services.map((s) => [s.id, s.basePrice])) as Record<
    string,
    number
  >;
  const activeLabel = activeCategory?.name ?? "All services";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-ui-lg border border-border-subtle bg-surface-elevated shadow-card">
        <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-5 sm:p-6 lg:p-7">
            <p className="text-caption font-semibold uppercase tracking-normal text-brand-primary">
              Service catalog
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-normal text-text-primary sm:text-4xl">
              Book trusted home services without the guesswork.
            </h1>
            <p className="mt-3 max-w-xl text-body-sm text-text-secondary">
              Search by need, compare time and price, then add the right service to your cart.
            </p>
            <div className="mt-5 grid grid-cols-3 divide-x divide-border-subtle rounded-ui bg-surface-muted">
              <div className="px-3 py-3">
                <p className="text-lg font-semibold text-text-primary">{services.length}</p>
                <p className="text-caption text-text-muted">Matches</p>
              </div>
              <div className="px-3 py-3">
                <p className="text-lg font-semibold text-text-primary">{categories.length}</p>
                <p className="text-caption text-text-muted">Categories</p>
              </div>
              <div className="px-3 py-3">
                <p className="text-lg font-semibold text-text-primary">COD</p>
                <p className="text-caption text-text-muted">Payment</p>
              </div>
            </div>
          </div>
          <div className="relative min-h-56 overflow-hidden bg-brand-primary-muted md:min-h-full">
            <div className="absolute inset-y-0 left-8 w-px rotate-12 bg-border-subtle/80" />
            <div className="absolute inset-y-0 left-24 w-px rotate-12 bg-border-subtle/60" />
            <div className="absolute right-8 top-8 h-24 w-36 rotate-6 rounded-ui border border-border-subtle bg-surface-elevated/50" />
            <div className="absolute bottom-16 right-16 h-16 w-28 -rotate-6 rounded-ui border border-border-subtle bg-brand-secondary-muted/70" />
            <div className="absolute inset-x-5 bottom-5 rounded-ui-lg border border-border-subtle bg-surface-elevated/90 p-4 shadow-card backdrop-blur">
              <p className="text-caption font-semibold text-text-muted">Browsing</p>
              <p className="mt-1 text-xl font-semibold text-text-primary">{activeLabel}</p>
              <p className="mt-1 line-clamp-2 text-body-sm text-text-secondary">
                {q ? `Search results for "${q}"` : "Curated services across cleaning, repair, beauty, and more."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-12">
        <section className="rounded-ui-lg border border-border-subtle bg-surface-elevated p-4 shadow-card md:sticky md:top-[76px] md:col-span-4 md:self-start lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-caption font-semibold text-text-muted">Filters</p>
              <h2 className="text-lg font-semibold text-text-primary">Find your service</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-ui bg-brand-primary-muted text-brand-primary">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18M6 12h12M10 18h4"
                />
              </svg>
            </div>
          </div>

          <form className="mt-4 space-y-4">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.2-5.2m0 0a7.5 7.5 0 1 0-10.6 0 7.5 7.5 0 0 0 10.6 0Z"
                />
              </svg>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search services"
                className="h-12 w-full rounded-full border border-border-subtle bg-surface-muted pl-11 pr-4 text-body-sm text-text-primary outline-none transition focus:border-border-strong focus:bg-surface-elevated focus:ring-2 focus:ring-brand-primary-muted"
              />
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:flex-col md:overflow-visible md:px-0">
              <button
                name="category"
                value=""
                className={[
                  "inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-body-sm font-semibold transition active:scale-95 md:justify-start",
                  !categorySlug
                    ? "bg-brand-primary text-text-inverse shadow-button-primary"
                    : "border border-border-subtle bg-surface-muted text-text-secondary hover:bg-brand-primary-muted hover:text-brand-primary"
                ].join(" ")}
              >
                All services
              </button>
              {categories.map((c) => {
                const active = c.slug === categorySlug;
                return (
                  <button
                    key={c.id}
                    name="category"
                    value={c.slug}
                    className={[
                      "inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-body-sm font-semibold transition active:scale-95 md:justify-start",
                      active
                        ? "bg-brand-primary text-text-inverse shadow-button-primary"
                        : "border border-border-subtle bg-surface-muted text-text-secondary hover:bg-brand-primary-muted hover:text-brand-primary"
                    ].join(" ")}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            <div className="rounded-ui bg-surface-muted px-3 py-2">
              <p className="text-caption text-text-muted">Showing</p>
              <p className="text-body-sm font-semibold text-text-primary">{activeLabel}</p>
            </div>
          </form>
        </section>

        <section className="space-y-4 md:col-span-8 lg:col-span-9">
          <div className="flex flex-col gap-2 border-b border-border-subtle pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-caption font-semibold text-text-muted">{activeLabel}</p>
              <h2 className="text-xl font-semibold text-text-primary">
                {services.length === 1 ? "1 service available" : `${services.length} services available`}
              </h2>
            </div>
            <p className="max-w-sm text-body-sm text-text-secondary">
              Prices are shown upfront. Final service scope is confirmed by the professional.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                id={s.id}
                categoryName={s.category.name}
                name={s.name}
                description={s.description}
                imageUrl={s.imageUrl}
                price={s.basePrice}
                minutes={s.estimatedMinutes}
              />
            ))}
          </div>

          {services.length === 0 ? (
            <div className="rounded-ui-lg border border-border-subtle bg-surface-elevated p-8 text-center shadow-card">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.2 16.2a4 4 0 0 1 5.6 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <p className="text-body-sm font-semibold text-text-primary">No services found</p>
              <p className="mt-1 text-caption text-text-muted">Try adjusting your search or filters.</p>
            </div>
          ) : null}
        </section>
      </div>

      <section className="grid gap-3 border-t border-border-subtle pt-5 sm:grid-cols-3">
        {[
          ["Verified providers", "Assigned staff are managed by the service team."],
          ["Clear pricing", "Catalog prices are shown before booking."],
          ["Pay after service", "COD flow keeps checkout simple for Phase 1."]
        ].map(([title, body]) => (
          <div key={title} className="rounded-ui bg-surface-muted p-4">
            <p className="text-body-sm font-semibold text-text-primary">{title}</p>
            <p className="mt-1 text-caption text-text-muted">{body}</p>
          </div>
        ))}
      </section>

      <CartBar prices={prices} />
    </div>
  );
}
