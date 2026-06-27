import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bankAccountCreateSchema } from "@/lib/schemas/bank-account";

async function getSession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize") || "10")));
    const search = searchParams.get("search") || undefined;
    const blocked = searchParams.get("blocked");
    const gender = searchParams.get("gender");

    const where: any = { blocked: false };
    if (search) {
      where.OR = [
        { accountNumber: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (blocked !== null && blocked !== undefined) {
      where.blocked = blocked === "true";
    }
    if (gender) {
      where.gender = gender;
    }

    const [data, total] = await Promise.all([
      prisma.bankAccount.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bankAccount.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bankAccountCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let accountNumber = parsed.data.accountNumber;
    if (!accountNumber) {
      const currentYear = new Date().getFullYear();
      const prefix = String(currentYear).substring(2);
      const existing = await prisma.bankAccount.findMany({
        where: { accountNumber: { startsWith: prefix } },
        select: { accountNumber: true },
      });
      const suffixes = existing.map((e) => Number(e.accountNumber.substring(2)));
      const maxSuffix = suffixes.length ? Math.max(...suffixes) : 0;
      const newSuffix = String(maxSuffix + 1).padStart(5, "0");
      accountNumber = `${prefix}${newSuffix}`;

      const duplicate = await prisma.bankAccount.findUnique({
        where: { accountNumber },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Generated account number not unique, retry." },
          { status: 409 }
        );
      }
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        ...parsed.data,
        accountNumber,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(bankAccount, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create bank account" },
      { status: 500 }
    );
  }
}
