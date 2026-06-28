import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerUpdateSchema } from "@/lib/schemas/partner";

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
    const partner = await prisma.partner.findUnique({
      where: { id, deleted: false },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    const transfers = await prisma.transfer.findMany({
      where: { partnerId: id },
      orderBy: { date: "asc" },
      include: { operator: true },
    });

    const transfersWithBalance = computeTransferBalances(transfers);

    return NextResponse.json({ ...partner, transfers: transfersWithBalance });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch partner" },
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
    const parsed = partnerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update partner" },
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
    const partner = await prisma.partner.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
