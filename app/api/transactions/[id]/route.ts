import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionUpdateSchema } from "@/lib/schemas/transaction";

async function getSession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
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
    const parsed = transactionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.transaction.findUnique({
      where: { id, deleted: false },
      include: { account: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const data: any = { ...parsed.data };
    if (data.date && typeof data.date === "string") {
      data.date = new Date(data.date);
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.update({
        where: { id },
        data,
      });

      if (parsed.data.amount !== undefined || parsed.data.type !== undefined) {
        let balanceAdjustment = 0;
        const oldType = existing.type;
        const oldAmount = existing.amount;
        const newType = parsed.data.type || oldType;
        const newAmount = parsed.data.amount !== undefined ? parsed.data.amount : oldAmount;

        if (oldType === "DEPOSIT") balanceAdjustment -= oldAmount;
        else balanceAdjustment += oldAmount;

        if (newType === "DEPOSIT") balanceAdjustment += newAmount;
        else balanceAdjustment -= newAmount;

        await tx.bankAccount.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceAdjustment } },
        });
      }

      return t;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transaction" },
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
    const existing = await prisma.transaction.findUnique({
      where: { id, deleted: false },
      include: { account: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // If this is a paired TRANSFER, also handle the other transaction
    const pairedIds: string[] = [];
    if (existing.transferGroupId) {
      const paired = await prisma.transaction.findMany({
        where: { transferGroupId: existing.transferGroupId, deleted: false },
      });
      pairedIds.push(...paired.map((t) => t.id));
    }
    const uniqueIds = Array.from(new Set([id, ...pairedIds]));

    await prisma.$transaction(async (tx) => {
      for (const txId of uniqueIds) {
        const txRecord = await tx.transaction.findUnique({
          where: { id: txId },
          include: { account: true },
        });
        if (!txRecord || txRecord.deleted) continue;

        let balanceAdjustment = 0;
        if (txRecord.type === "DEPOSIT") balanceAdjustment -= txRecord.amount;
        else if (txRecord.type === "WITHDRAWAL") balanceAdjustment += txRecord.amount;
        else if (txRecord.type === "TRANSFER") {
          if (txRecord.accountId === txRecord.fromAccountId) balanceAdjustment += txRecord.amount;
          else if (txRecord.accountId === txRecord.toAccountId) balanceAdjustment -= txRecord.amount;
        }

        await tx.transaction.update({
          where: { id: txId },
          data: { deleted: true },
        });
        await tx.bankAccount.update({
          where: { id: txRecord.accountId },
          data: { balance: { increment: balanceAdjustment } },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
