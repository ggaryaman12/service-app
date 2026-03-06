import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { columnExists } from "@/lib/db-meta";
import { TrustBadge } from "@/components/trust-badge";

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const hasServiceImage = await columnExists("Service", "image");
  const service = await prisma.service.findUnique({
    where: { id: slug },
    select: {
      id: true,
      name: true,
      description: true,
      basePrice: true,
      estimatedMinutes: true,
      ...(hasServiceImage ? { image: true } : {}),
      category: { select: { name: true } }
    }
  });

  if (!service) notFound();

  return (
    <div className="grid gap-5 md:grid-cols-12">
      <section className="md:col-span-7 space-y-4">
        <div className="-mx-4 overflow-hidden bg-white shadow-sm ring-1 ring-slate-200 md:mx-0 md:rounded-2xl">
          <div className="relative aspect-[16/10] w-full bg-slate-100">
            {"image" in service && service.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(service as { image?: string }).image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
            )}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <TrustBadge tone="green" label="Verified Pro" />
              <TrustBadge tone="blue" label="Pay After Service" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">{service.category.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            {service.name}
          </h1>
          <p className="text-sm text-slate-500 whitespace-pre-wrap">{service.description}</p>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Details</h2>
          <div className="mt-3 space-y-2">
            <details className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                What’s included
              </summary>
              <p className="mt-2 text-sm text-slate-500">
                Standard checklist for this service. Your professional will confirm specifics on
                arrival.
              </p>
            </details>
            <details className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                What’s excluded
              </summary>
              <p className="mt-2 text-sm text-slate-500">
                Any parts/materials not explicitly listed. Extra work is confirmed before
                proceeding.
              </p>
            </details>
            <details className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">FAQ</summary>
              <p className="mt-2 text-sm text-slate-500">
                Payment is COD only. You can add notes at checkout.
              </p>
            </details>
          </div>
        </section>
      </section>

      <aside className="md:col-span-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:sticky md:top-[76px]">
          <p className="text-xs font-semibold text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">₹{service.basePrice}</p>
          <p className="mt-1 text-sm text-slate-500">{service.estimatedMinutes} mins estimated</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TrustBadge tone="blue" label="COD only" />
            <TrustBadge tone="green" label="Verified pros" />
          </div>
          <Link
            href={`/book/${service.id}`}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
          >
            Book now
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            No online payments. Pay after service completion.
          </p>
        </div>
      </aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl border-t border-slate-200 bg-white/90 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-semibold text-slate-900">₹{service.basePrice}</p>
          </div>
          <Link
            href={`/book/${service.id}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
          >
            Book now
          </Link>
        </div>
      </div>

      <div className="h-14 md:hidden" aria-hidden />
    </div>
  );
}
