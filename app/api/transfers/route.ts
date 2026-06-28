import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transferCreateSchema } from "@/lib/schemas/transfer";

async function getSession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
}

function computeTransferBalances(transfers: any[]) {
  let balanceAfter = 0;
  return transfers.map((t) => {
    if (t.type === "GOLD_TRANSFER") balanceAfter += t.amount;
    else if (t.type === "MONEY_TRANSFER") balanceAfter -= t.amount;
    return { ...t, balanceAfter };
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(99999, Number(searchParams.get("pageSize") || "10")));
    const partnerId = searchParams.get("partnerId") || undefined;
    const type = searchParams.get("type") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const where: any = {};
    if (partnerId) where.partnerId = partnerId;
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    let transfers = await prisma.transfer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "asc" },
      include: { operator: true, partner: true },
    });

    if (partnerId) {
      transfers = computeTransferBalances(transfers);
    }

    const total = await prisma.transfer.count({ where });

    return NextResponse.json({ data: transfers, total, page, pageSize });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
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
    const parsed = transferCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const { partnerId, amount, type } = parsed.data;

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId, deleted: false },
    });
    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    let newBalance = partner.balance;
    if (type === "GOLD_TRANSFER") newBalance += amount;
    else if (type === "MONEY_TRANSFER") newBalance -= amount;

    const transfer = await prisma.$transaction(async (tx) => {
      const t = await tx.transfer.create({
        data: {
          ...parsed.data,
          operatorId: session.user.id,
          date: typeof parsed.data.date === "string" ? new Date(parsed.data.date) : parsed.data.date,
        },
      });
      await tx.partner.update({
        where: { id: partnerId },
        data: { balance: newBalance },
      });
      return t;
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
