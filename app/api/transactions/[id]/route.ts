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
      where: { id },
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

      if (parsed.data.amount !== undefined && existing.type === "TRANSFER") {
        const oldAmount = existing.amount;
        const newAmount = parsed.data.amount;

        if (oldAmount !== newAmount) {
          // Find the paired transaction via transferGroupId
          const paired = await tx.transaction.findFirst({
            where: { transferGroupId: existing.transferGroupId, id: { not: id } },
          });

          // Adjust fromAccount balance: less debit if amount decreased
          await tx.bankAccount.update({
            where: { id: existing.fromAccountId! },
            data: { balance: { increment: oldAmount - newAmount } },
          });

          // Adjust toAccount balance: less credit if amount decreased
          await tx.bankAccount.update({
            where: { id: existing.toAccountId! },
            data: { balance: { increment: newAmount - oldAmount } },
          });

          // Also update the paired transaction's amount to keep them in sync
          if (paired) {
            await tx.transaction.update({
              where: { id: paired.id },
              data: { amount: newAmount },
            });
          }
        }
      } else if (parsed.data.amount !== undefined) {
        // Non-TRANSFER: simple balance adjustment on the single account
        let balanceAdjustment = 0;
        const oldAmount = existing.amount;
        const newAmount = parsed.data.amount;

        if (existing.type === "DEPOSIT") balanceAdjustment -= oldAmount;
        else balanceAdjustment += oldAmount;

        if (existing.type === "DEPOSIT") balanceAdjustment += newAmount;
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
      where: { id },
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
        where: { transferGroupId: existing.transferGroupId },
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
        if (!txRecord) continue;

        let balanceAdjustment = 0;
        if (txRecord.type === "DEPOSIT") balanceAdjustment -= txRecord.amount;
        else if (txRecord.type === "WITHDRAWAL") balanceAdjustment += txRecord.amount;
        else if (txRecord.type === "TRANSFER") {
          if (txRecord.accountId === txRecord.fromAccountId) balanceAdjustment += txRecord.amount;
          else if (txRecord.accountId === txRecord.toAccountId) balanceAdjustment -= txRecord.amount;
        }

        await tx.transaction.delete({
          where: { id: txId },
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
