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

  const campaign = await prisma.liveCampaign.findUnique({
    where: { id },
    select: { contributorId: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "غير موجودة" }, { status: 404 });
  }

  const isOwner = campaign.contributorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const payments = await prisma.payment.findMany({
    where: { campaignId: id, status: "PENDING" },
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
