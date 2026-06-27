import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transferUpdateSchema } from "@/lib/schemas/transfer";

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
    const parsed = transferUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.transfer.findUnique({
      where: { id },
      include: { partner: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    const data: any = { ...parsed.data };
    if (data.date && typeof data.date === "string") {
      data.date = new Date(data.date);
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const t = await tx.transfer.update({
        where: { id },
        data,
      });

      if (parsed.data.amount !== undefined || parsed.data.type !== undefined) {
        let balanceAdjustment = 0;
        const oldType = existing.type;
        const oldAmount = existing.amount;
        const newType = parsed.data.type || oldType;
        const newAmount = parsed.data.amount !== undefined ? parsed.data.amount : oldAmount;

        if (oldType === "GOLD_TRANSFER") balanceAdjustment -= oldAmount;
        else balanceAdjustment += oldAmount;

        if (newType === "GOLD_TRANSFER") balanceAdjustment += newAmount;
        else balanceAdjustment -= newAmount;

        await tx.partner.update({
          where: { id: existing.partnerId },
          data: { balance: { increment: balanceAdjustment } },
        });
      }

      return t;
    });

    return NextResponse.json(transfer);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transfer" },
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
    const existing = await prisma.transfer.findUnique({
      where: { id },
      include: { partner: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    let balanceAdjustment = 0;
    if (existing.type === "GOLD_TRANSFER") balanceAdjustment -= existing.amount;
    else balanceAdjustment += existing.amount;

    await prisma.$transaction(async (tx) => {
      await tx.transfer.delete({
        where: { id },
      });
      await tx.partner.update({
        where: { id: existing.partnerId },
        data: { balance: { increment: balanceAdjustment } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transfer" },
      { status: 500 }
    );
  }
}
