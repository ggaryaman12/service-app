import { prisma } from "@/lib/prisma";

export async function tableExists(tableName: string) {
  try {
    const rows = await prisma.$queryRaw<Array<{ c: bigint }>>`
      SELECT COUNT(*) as c
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ${tableName}
    `;
    const c = rows?.[0]?.c ?? 0n;
    return c > 0n;
  } catch {
    return false;
  }
}

export async function columnExists(tableName: string, columnName: string) {
  try {
    const rows = await prisma.$queryRaw<Array<{ c: bigint }>>`
      SELECT COUNT(*) as c
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    `;
    const c = rows?.[0]?.c ?? 0n;
    return c > 0n;
  } catch {
    return false;
  }
}
