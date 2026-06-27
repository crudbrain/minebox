import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionCreateSchema } from "@/lib/schemas/transaction";

async function getSession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
}

function computeTransactionBalances(transactions: any[]) {
  let balanceAfter = 0;
  return transactions.map((t) => {
    if (t.type === "DEPOSIT") balanceAfter += t.amount;
    else if (t.type === "WITHDRAWAL" || t.type === "TRANSFER") balanceAfter -= t.amount;
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
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize") || "10")));
    const accountId = searchParams.get("accountId") || undefined;
    const type = searchParams.get("type") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const where: any = { deleted: false };
    if (accountId) where.accountId = accountId;
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    let transactions = await prisma.transaction.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "asc" },
      include: { operator: true, account: true },
    });

    if (accountId) {
      transactions = computeTransactionBalances(transactions);
    }

    const total = await prisma.transaction.count({ where });

    return NextResponse.json({ data: transactions, total, page, pageSize });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
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
    const parsed = transactionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { accountId, amount, type } = parsed.data;

    const account = await prisma.bankAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    let newBalance = account.balance;
    if (type === "DEPOSIT") newBalance += amount;
    else if (type === "WITHDRAWAL" || type === "TRANSFER") newBalance -= amount;

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          ...parsed.data,
          operatorId: session.user.id,
          date: typeof parsed.data.date === "string" ? new Date(parsed.data.date) : parsed.data.date,
        },
      });
      await tx.bankAccount.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });
      return t;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
