import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;

  const need = await prisma.need.findUnique({
    where: { id },
    select: { posterId: true },
  });

  if (!need || need.posterId !== session.user.id) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const payments = await prisma.payment.findMany({
    where: { needId: id, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      amount: true,
      method: true,
      proofImageUrl: true,
      createdAt: true,
      supporter: { select: { name: true } },
    },
  });

  return NextResponse.json({ payments });
}
