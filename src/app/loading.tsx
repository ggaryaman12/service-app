export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-28 rounded-2xl bg-slate-200/70 animate-pulse" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" />
        ))}
      </div>
      <div className="h-36 rounded-2xl bg-slate-200/70 animate-pulse" />
    </div>
  );
}

