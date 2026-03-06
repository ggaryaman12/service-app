import Link from "next/link";
import { ServiceAddControl } from "@/components/cart/service-add-control";

type ServiceCardProps = {
  id: string;
  categoryName: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  minutes: number;
};

export function ServiceCard({
  id,
  categoryName,
  name,
  description,
  imageUrl,
  price,
  minutes
}: ServiceCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:ring-slate-300/50">
      <div className="flex">
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1">
            <span className="text-xs font-medium text-blue-700">{categoryName}</span>
          </div>
          <Link
            href={`/service/${id}`}
            className="block"
          >
            <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
              {name}
            </h3>
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-slate-900">₹{price}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>{minutes} mins</span>
            </div>
          </div>
        </div>

        <div className="relative h-full w-28 shrink-0 overflow-hidden bg-slate-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <ServiceAddControl serviceId={id} />
          </div>
        </div>
      </div>
    </article>
  );
}
