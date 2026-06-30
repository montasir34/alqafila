import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaign = await prisma.liveCampaign.findUnique({
    where: { id },
    include: {
      contributor: { select: { id: true, name: true, image: true } },
      payments: {
        where: { status: "CONFIRMED" },
        orderBy: { confirmedAt: "desc" },
        take: 20,
        select: {
          id: true, amount: true, method: true, confirmedAt: true,
          supporter: { select: { name: true } },
        },
      },
      disbursements: {
        orderBy: { spentAt: "desc" },
        select: { id: true, amount: true, recipient: true, proofUrl: true, spentAt: true },
      },
      _count: { select: { payments: true } },
    },
  });

  if (!campaign) return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.liveCampaign.findUnique({ where: { id }, select: { contributorId: true } });
  if (!campaign) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const isOwner = campaign.contributorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });

  const { status } = await req.json() as { status: string };
  if (!["COMPLETED", "CLOSED"].includes(status)) {
    return NextResponse.json({ error: "حالة غير مسموح بها" }, { status: 400 });
  }

  const updated = await prisma.liveCampaign.update({
    where: { id },
    data: { status: status as "COMPLETED" | "CLOSED", endedAt: new Date() },
    select: { id: true, status: true },
  });
  return NextResponse.json(updated);
}
