import { prisma } from "@/lib/prisma";
import { columnExists } from "@/lib/db-meta";
import { ServiceCard } from "@/components/service-card";
import { CartBar } from "@/components/cart/cart-bar";

export default async function ServicesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();
  const categorySlug = (sp.category ?? "").trim();

  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null;

  const hasServiceImage = await columnExists("Service", "image");

  const services = await prisma.service.findMany({
    where: {
      ...(category ? { categoryId: category.id } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { category: { name: { contains: q } } }
            ]
          }
        : {})
    },
    select: {
      id: true,
      name: true,
      description: true,
      basePrice: true,
      estimatedMinutes: true,
      ...(hasServiceImage ? { image: true } : {}),
      category: { select: { name: true } }
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
  });

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  const prices = Object.fromEntries(services.map((s) => [s.id, s.basePrice])) as Record<
    string,
    number
  >;

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/50 md:col-span-4 md:sticky md:top-[76px] md:self-start">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Our Services</h1>
        </div>
        <form className="mt-4 space-y-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search services..."
              className="h-12 w-full rounded-xl bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            <button
              name="category"
              value=""
              className={[
                "inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium ring-1 transition-all",
                !categorySlug
                  ? "bg-blue-600 text-white ring-blue-600 shadow-lg shadow-blue-600/25"
                  : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100"
              ].join(" ")}
            >
              All
            </button>
            {categories.map((c) => {
              const active = c.slug === categorySlug;
              return (
                <button
                  key={c.id}
                  name="category"
                  value={c.slug}
                  className={[
                    "inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium ring-1 transition-all",
                    active
                      ? "bg-blue-600 text-white ring-blue-600 shadow-lg shadow-blue-600/25"
                      : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100"
                  ].join(" ")}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {category ? (
            <p className="text-sm text-slate-500">
              Showing: <span className="font-semibold text-blue-600">{category.name}</span>
            </p>
          ) : null}
        </form>
      </section>

      <section className="grid gap-4 md:col-span-8 md:grid-cols-2 lg:grid-cols-2">
        {services.map((s) => (
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
        {services.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 md:col-span-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">No services found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : null}
      </section>

      <CartBar prices={prices} />
    </div>
  );
}
