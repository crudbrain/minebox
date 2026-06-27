import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bankAccountUpdateSchema } from "@/lib/schemas/bank-account";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountId: id, deleted: false },
      orderBy: { date: "asc" },
      include: { operator: true },
    });

    const transactionsWithBalance = computeTransactionBalances(transactions);

    return NextResponse.json({ ...bankAccount, transactions: transactionsWithBalance });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bank account" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = bankAccountUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update bank account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: { blocked: true },
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete bank account" },
      { status: 500 }
    );
  }
}
