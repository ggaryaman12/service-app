import Link from "next/link";

export default function ManagerHomePage() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        className="rounded-lg border border-neutral-200 p-4 text-sm hover:border-neutral-300"
        href="/manager/bookings"
      >
        Bookings
      </Link>
      <Link
        className="rounded-lg border border-neutral-200 p-4 text-sm hover:border-neutral-300"
        href="/manager/dispatch"
      >
        Dispatch screen
      </Link>
    </div>
  );
}

