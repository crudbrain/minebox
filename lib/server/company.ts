import { prisma } from "@/lib/prisma";

export async function generateCompanyCode(): Promise<string | null> {
  const currentYear = new Date().getFullYear();
  const yearSuffix = String(currentYear).substring(2);
  const prefix = `CMP-${yearSuffix}`;

  const existing = await prisma.company.findMany({
    where: { code: { startsWith: prefix } },
    select: { code: true },
  });

  const suffixes = existing.map((e) => Number(e.code.substring(prefix.length)));
  const maxSuffix = suffixes.length ? Math.max(...suffixes) : 0;
  const newSuffix = String(maxSuffix + 1).padStart(5, "0");
  const newCode = `${prefix}${newSuffix}`;

  const duplicate = await prisma.company.findUnique({
    where: { code: newCode },
  });

  if (duplicate) {
    return null;
  }

  return newCode;
}
