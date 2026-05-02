import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/route-transition";
import { getCatalogServiceDetail } from "@/features/catalog/catalog.service";

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const detail = await getCatalogServiceDetail(slug);

  if (!detail) notFound();

  const serviceImage = detail.imageUrl;
  const serviceFacts = [
    ["Price", `₹${detail.basePrice}`],
    ["Duration", `${detail.estimatedMinutes} mins`],
    ["Payment", "COD"]
  ];
  const detailSections = [
    [
      "What’s included",
      "A standard service checklist, arrival confirmation, and scope review before work starts."
    ],
    [
      "What’s excluded",
      "Parts, materials, or additional work that is not confirmed with you before proceeding."
    ],
    ["Booking notes", "Add access instructions, preferred timing, or service details during checkout."]
  ];

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <TransitionLink
        href="/services"
        transitionLabel="Services"
        className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-secondary transition hover:text-brand-primary active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
        </svg>
        Services
      </TransitionLink>

      <div className="grid gap-6 md:grid-cols-12">
        <section className="space-y-5 md:col-span-7 lg:col-span-8">
          <div className="-mx-4 overflow-hidden bg-surface-elevated shadow-card ring-1 ring-border-subtle md:mx-0 md:rounded-ui-lg">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
              {serviceImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={serviceImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-muted to-surface-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {["Verified provider", "Pay after service", "Managed booking"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex rounded-full bg-surface-elevated/90 px-3 py-1 text-caption font-semibold text-text-primary shadow-card backdrop-blur"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <TransitionLink
                href={`/services?category=${detail.category.slug}`}
                transitionLabel={detail.category.name}
                className="text-caption font-semibold uppercase tracking-normal text-brand-primary transition hover:text-text-primary"
              >
                {detail.category.name}
              </TransitionLink>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-text-primary md:text-4xl">
                {detail.name}
              </h1>
              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-body text-text-secondary">
                {detail.description}
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border-subtle rounded-ui-lg border border-border-subtle bg-surface-elevated shadow-card">
              {serviceFacts.map(([label, value]) => (
                <div key={label} className="px-3 py-4 sm:px-4">
                  <p className="text-caption text-text-muted">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="space-y-3 border-t border-border-subtle pt-5">
            <div>
              <p className="text-caption font-semibold text-text-muted">Service details</p>
              <h2 className="text-xl font-semibold text-text-primary">Know before booking</h2>
            </div>
            <div className="space-y-2">
              {detailSections.map(([title, body]) => (
                <details
                  key={title}
                  className="group rounded-ui border border-border-subtle bg-surface-elevated px-4 py-3 shadow-card transition hover:border-border-strong"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body-sm font-semibold text-text-primary">
                    {title}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted transition group-open:rotate-45 group-open:text-brand-primary">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-2 max-w-2xl text-body-sm text-text-secondary">{body}</p>
                </details>
              ))}
            </div>
          </section>
        </section>

        <aside className="md:col-span-5 lg:col-span-4">
          <div className="rounded-ui-lg border border-border-subtle bg-surface-elevated p-5 shadow-card md:sticky md:top-[76px]">
            <p className="text-caption font-semibold text-text-muted">Booking summary</p>
            <p className="mt-2 text-3xl font-semibold text-text-primary">₹{detail.basePrice}</p>
            <p className="mt-1 text-body-sm text-text-secondary">
              {detail.estimatedMinutes} mins estimated. Pay after service completion.
            </p>

            <div className="mt-5 space-y-3 rounded-ui bg-surface-muted p-4">
              {[
                ["Service", detail.name],
                ["Category", detail.category.name],
                ["Payment mode", "Cash on delivery"]
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <p className="text-caption text-text-muted">{label}</p>
                  <p className="max-w-[11rem] text-right text-body-sm font-semibold text-text-primary">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <TransitionLink
              href={`/book/${detail.id}`}
              transitionLabel="Book service"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary px-4 text-body-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
            >
              Book now
            </TransitionLink>
            <TransitionLink
              href="/services"
              transitionLabel="Services"
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-border-subtle bg-surface-elevated px-4 text-body-sm font-semibold text-text-secondary transition hover:bg-surface-muted active:scale-95"
            >
              Browse more services
            </TransitionLink>

            <p className="mt-4 text-caption text-text-muted">
              Your professional confirms the final scope before starting the job.
            </p>
          </div>
        </aside>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl border-t border-border-subtle bg-surface-elevated/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-caption text-text-muted">Total</p>
            <p className="text-lg font-semibold text-text-primary">₹{detail.basePrice}</p>
          </div>
          <TransitionLink
            href={`/book/${detail.id}`}
            transitionLabel="Book service"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-brand-primary px-4 text-body-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
          >
            Book now
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
