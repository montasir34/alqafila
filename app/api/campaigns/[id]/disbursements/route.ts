import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createDisbursementSchema } from "@/lib/validations/campaign";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const { id: campaignId } = await params;
  const campaign = await prisma.liveCampaign.findUnique({
    where: { id: campaignId },
    select: { contributorId: true, raisedAmount: true },
  });
  if (!campaign) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (campaign.contributorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createDisbursementSchema.safeParse({ ...body, campaignId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const disbursement = await prisma.campaignDisbursement.create({
    data: parsed.data,
    select: { id: true, amount: true, recipient: true, spentAt: true },
  });
  return NextResponse.json(disbursement, { status: 201 });
}
