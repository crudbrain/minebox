import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      numberOfAccountsResult,
      totalBanckResult,
      totalCreditResult,
      numberOfPartnersResult,
      totalPartnersCreditResult,
    ] = await Promise.all([
      prisma.bankAccount.aggregate({
        where: { blocked: false },
        _count: true,
      }),
      prisma.bankAccount.aggregate({
        where: { blocked: false, balance: { gt: 0 } },
        _sum: { balance: true },
      }),
      prisma.bankAccount.aggregate({
        where: { blocked: false, balance: { lt: 0 } },
        _sum: { balance: true },
      }),
      prisma.partner.aggregate({
        where: { deleted: false },
        _count: true,
      }),
      prisma.partner.aggregate({
        where: { deleted: false },
        _sum: { balance: true },
      }),
    ]);

    const numberOfAccounts = numberOfAccountsResult._count;
    const totalBanck = totalBanckResult._sum.balance ?? 0;
    const totalCredit = totalCreditResult._sum.balance ?? 0;
    const numberOfPartners = numberOfPartnersResult._count;
    const totalPartnersCredit = totalPartnersCreditResult._sum.balance ?? 0;

    return NextResponse.json({
      bankAccounts: { numberOfAccounts, totalBanck, totalCredit },
      partners: { numberOfPartners, totalPartnersCredit },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
