export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 py-6 text-xs text-neutral-600">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} JammuServe</p>
        <p>Pay-after-service (COD) only.</p>
      </div>
    </footer>
  );
}

