import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// صاحب الحوجة يؤكد أو يرفض الدفعة
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      need: { select: { posterId: true, targetAmount: true, collectedAmount: true, status: true } },
      campaign: { select: { contributorId: true, goalAmount: true, raisedAmount: true } },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "الدفعة غير موجودة" }, { status: 404 });
  }

  // فقط صاحب الحوجة أو الحملة أو الأدمن يمكنه التأكيد
  const ownerId =
    payment.need?.posterId ?? payment.campaign?.contributorId ?? null;
  const isAdmin = session.user.role === "ADMIN";

  if (ownerId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  if (payment.status !== "PENDING") {
    return NextResponse.json(
      { error: "الدفعة تمت معالجتها بالفعل" },
      { status: 409 }
    );
  }

  const { action } = await req.json() as { action: "confirm" | "reject" };
  if (!["confirm", "reject"].includes(action)) {
    return NextResponse.json({ error: "إجراء غير صحيح" }, { status: 400 });
  }

  if (action === "confirm") {
    // تحديث الدفعة وزيادة المبلغ المجمّع في transaction
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });

      if (payment.needId && payment.need) {
        const newAmount = payment.need.collectedAmount + payment.amount;
        const isFulfilled = newAmount >= payment.need.targetAmount;
        await tx.need.update({
          where: { id: payment.needId },
          data: {
            collectedAmount: newAmount,
            ...(isFulfilled && { status: "FULFILLED" }),
          },
        });
      }

      if (payment.campaignId && payment.campaign) {
        await tx.liveCampaign.update({
          where: { id: payment.campaignId },
          data: { raisedAmount: { increment: payment.amount } },
        });
      }
    });

    return NextResponse.json({ status: "CONFIRMED" });
  } else {
    await prisma.payment.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ status: "REJECTED" });
  }
}
