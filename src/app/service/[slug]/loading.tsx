export default function Loading() {
  return (
    <div className="grid gap-5 md:grid-cols-12">
      <div className="space-y-4 md:col-span-7">
        <div className="-mx-4 aspect-[16/10] skeleton-shimmer md:mx-0 md:rounded-ui-lg" />
        <div className="h-20 rounded-ui-lg skeleton-shimmer" />
        <div className="h-48 rounded-ui-lg skeleton-shimmer" />
      </div>
      <div className="h-64 rounded-ui-lg skeleton-shimmer md:col-span-5" />
    </div>
  );
}
