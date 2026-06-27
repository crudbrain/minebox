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

    const currentYear = new Date().getFullYear();
    const prefix = String(currentYear).substring(2);
    const existing = await prisma.bankAccount.findMany({
      where: { accountNumber: { startsWith: prefix } },
      select: { accountNumber: true },
    });
    const suffixes = existing.map((e) => Number(e.accountNumber.substring(2)));
    const maxSuffix = suffixes.length ? Math.max(...suffixes) : 0;
    const newSuffix = String(maxSuffix + 1).padStart(5, "0");
    const newAccountNumber = `${prefix}${newSuffix}`;

    const duplicate = await prisma.bankAccount.findUnique({
      where: { accountNumber: newAccountNumber },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Generated account number not unique, retry." },
        { status: 409 }
      );
    }

    return NextResponse.json({ accountNumber: newAccountNumber });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate account number" },
      { status: 500 }
    );
  }
}
