import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tableExists } from "@/lib/db-meta";

export async function AnnouncementBar() {
  const hasSettings = await tableExists("SiteSetting");
  if (!hasSettings) return null;

  const setting = await prisma.siteSetting.findFirst({
    orderBy: { updatedAt: "desc" }
  });
  if (!setting?.announcementEnabled || !setting.announcementText) return null;

  return (
    <div className="-mx-4 border-b border-slate-200 bg-slate-900 px-4 py-2 text-white">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-xs sm:text-sm">{setting.announcementText}</p>
        <Link
          href="/services"
          className="hidden h-9 items-center rounded-full bg-white/10 px-3 text-xs font-semibold text-white ring-1 ring-white/15 transition-transform active:scale-95 sm:inline-flex"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}
